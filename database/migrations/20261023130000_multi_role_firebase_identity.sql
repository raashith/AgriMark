-- Multi-role identities for Firebase-backed AgriMark accounts.
-- A Firebase identity and public profile remain one-per-person; profile_roles records
-- additional workspaces and profiles.role tracks the currently selected workspace.

create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('farmer', 'buyer', 'fpo', 'logistics', 'service_provider')),
  created_at timestamptz not null default now(),
  primary key (profile_id, role)
);

alter table public.profile_roles enable row level security;
revoke all on table public.profile_roles from public, anon, authenticated;
grant all on table public.profile_roles to service_role;

-- Backfill existing accounts with their current role before any role switch.
insert into public.profile_roles (profile_id, role)
select p.id, p.role
from public.profiles p
where p.role in ('farmer', 'buyer', 'fpo', 'logistics', 'service_provider')
on conflict on constraint profile_roles_pkey do nothing;

create or replace function public.ensure_firebase_identity(
  p_firebase_uid text,
  p_email text default null,
  p_full_name text default null,
  p_phone text default null,
  p_requested_role text default null
)
returns table (
  id uuid,
  full_name text,
  phone text,
  role text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid;
  v_role text;
  v_existing_role text;
  v_requested_role text := nullif(trim(p_requested_role), '');
  v_allowed_roles text[] := array['farmer', 'buyer', 'fpo', 'logistics', 'service_provider'];
begin
  if nullif(trim(p_firebase_uid), '') is null then
    raise exception 'Firebase identity is required.';
  end if;

  if v_requested_role = 'admin' then
    raise exception 'Self-registration as admin is prohibited.';
  end if;

  if v_requested_role is not null and not (v_requested_role = any(v_allowed_roles)) then
    raise exception 'Unsupported AgriMark role.';
  end if;

  -- Serialize simultaneous login and auth-state refresh callbacks for the same UID.
  perform pg_advisory_xact_lock(hashtextextended(p_firebase_uid, 0));

  select fi.profile_id into v_profile_id
  from public.firebase_identities fi
  where fi.firebase_uid = p_firebase_uid
  for update;

  if v_profile_id is not null then
    select p.role into v_existing_role
    from public.profiles p
    where p.id = v_profile_id
    for update;
  end if;

  -- Explicit role selection switches the active workspace. A background auth refresh
  -- has no requested role and therefore preserves the current workspace.
  v_role := coalesce(v_requested_role, v_existing_role, 'farmer');

  if v_profile_id is null then
    v_profile_id := gen_random_uuid();

    insert into public.profiles (id, full_name, phone, role)
    values (
      v_profile_id,
      coalesce(nullif(trim(p_full_name), ''), case when p_email like '%@%' then split_part(p_email, '@', 1) else 'AgriMark User' end),
      p_phone,
      v_role
    );

    insert into public.firebase_identities (firebase_uid, profile_id, email)
    values (p_firebase_uid, v_profile_id, p_email)
    on conflict (firebase_uid) do update
      set email = coalesce(excluded.email, firebase_identities.email)
      returning profile_id into v_profile_id;
  else
    update public.profiles p
      set full_name = coalesce(nullif(trim(p.full_name), ''), nullif(trim(p_full_name), ''), case when p_email like '%@%' then split_part(p_email, '@', 1) else null end),
          phone = coalesce(p.phone, p_phone),
          role = v_role,
          updated_at = now()
    where p.id = v_profile_id;

    update public.firebase_identities fi
      set email = coalesce(p_email, fi.email), updated_at = now()
    where fi.firebase_uid = p_firebase_uid;
  end if;

  -- Membership is additive: switching Farmer -> Buyer does not remove Farmer.
  -- Existing admin profiles are preserved, but admin is never a self-assignable membership.
  if v_role = any(v_allowed_roles) then
    insert into public.profile_roles (profile_id, role)
    values (v_profile_id, v_role)
    on conflict on constraint profile_roles_pkey do nothing;
  end if;

  if v_role = 'buyer' then
    insert into public.buyer_profiles (user_id)
    values (v_profile_id)
    on conflict (user_id) do nothing;
  end if;

  return query
  select p.id, p.full_name, p.phone, p.role, p.created_at, p.updated_at
  from public.profiles p
  where p.id = v_profile_id;
end;
$$;

revoke all on function public.ensure_firebase_identity(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.ensure_firebase_identity(text, text, text, text, text) to service_role;
