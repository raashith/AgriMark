-- AgriMark core catalog + farm harvest schema for the active Supabase project.
-- Public users may read the crop catalog, harvest batches and available lots.
-- Farm and profile writes remain server-side and are restricted to the validated Firebase profile.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  phone text,
  role text not null default 'farmer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crops (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  village text,
  district text,
  state text,
  latitude double precision,
  longitude double precision,
  area_acres numeric(12,2) default 0 check (area_acres is null or area_acres >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.cultivations (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  crop_id uuid not null references public.crops(id),
  season text,
  sowing_date date,
  expected_harvest_date date,
  area_acres numeric(12,2) check (area_acres is null or area_acres >= 0),
  status text not null default 'planned',
  created_at timestamptz not null default now()
);

create table if not exists public.harvest_batches (
  id uuid primary key default gen_random_uuid(),
  cultivation_id uuid not null references public.cultivations(id) on delete cascade,
  farm_id uuid not null references public.farms(id) on delete cascade,
  harvested_at date not null,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null default 'kg',
  grade text not null,
  trace_code text not null unique default ('AGR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))),
  created_at timestamptz not null default now()
);

create table if not exists public.produce_lots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  cultivation_id uuid references public.cultivations(id) on delete set null,
  crop_id uuid not null references public.crops(id),
  quantity numeric(14,3) not null check (quantity >= 0),
  unit text not null default 'kg',
  quality_grade text,
  available_quantity numeric(14,3) check (available_quantity is null or available_quantity >= 0),
  harvested_at date,
  status text not null default 'available',
  is_listed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.firebase_identities (
  firebase_uid varchar(128) primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_farms_owner_id on public.farms(owner_id);
create index if not exists idx_cultivations_farm_id on public.cultivations(farm_id);
create index if not exists idx_cultivations_crop_id on public.cultivations(crop_id);
create index if not exists idx_harvest_batches_cultivation_id on public.harvest_batches(cultivation_id);
create index if not exists idx_harvest_batches_farm_id on public.harvest_batches(farm_id);
create index if not exists idx_produce_lots_owner_id on public.produce_lots(owner_id);
create index if not exists idx_firebase_identities_profile_id on public.firebase_identities(profile_id);

alter table public.profiles enable row level security;
alter table public.crops enable row level security;
alter table public.farms enable row level security;
alter table public.cultivations enable row level security;
alter table public.harvest_batches enable row level security;
alter table public.produce_lots enable row level security;
alter table public.firebase_identities enable row level security;

drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists farms_owner_access on public.farms;
create policy farms_owner_access on public.farms for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists cultivations_owner_access on public.cultivations;
create policy cultivations_owner_access on public.cultivations for all to authenticated
using (exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid())))
with check (exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid())));

drop policy if exists lots_owner_access on public.produce_lots;
create policy lots_owner_access on public.produce_lots for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists crops_public_read on public.crops;
create policy crops_public_read on public.crops for select to anon, authenticated using (true);

drop policy if exists harvest_batches_public_read on public.harvest_batches;
create policy harvest_batches_public_read on public.harvest_batches for select to anon, authenticated using (true);

drop policy if exists produce_lots_public_read on public.produce_lots;
create policy produce_lots_public_read on public.produce_lots for select to anon, authenticated using (true);

drop policy if exists "Service role full access to firebase_identities" on public.firebase_identities;
create policy "Service role full access to firebase_identities" on public.firebase_identities
for all to service_role using (true) with check (true);

grant select on public.crops, public.harvest_batches, public.produce_lots to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.farms, public.cultivations, public.harvest_batches, public.produce_lots to authenticated;
grant all on public.profiles, public.crops, public.farms, public.cultivations, public.harvest_batches, public.produce_lots, public.firebase_identities to service_role;

create or replace function public.ensure_firebase_identity(
  p_firebase_uid text,
  p_email text default null,
  p_full_name text default null,
  p_phone text default null,
  p_requested_role text default 'farmer'
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
  v_allowed_roles text[] := array['farmer','buyer','fpo','logistics','service_provider'];
begin
  if p_requested_role = 'admin' then
    raise exception 'Self-registration as admin is prohibited.';
  end if;

  if p_requested_role = any(v_allowed_roles) then
    v_role := p_requested_role;
  else
    v_role := 'farmer';
  end if;

  select fi.profile_id into v_profile_id
  from public.firebase_identities fi
  where fi.firebase_uid = p_firebase_uid;

  if v_profile_id is null then
    v_profile_id := gen_random_uuid();

    insert into public.profiles (id, full_name, phone, role)
    values (
      v_profile_id,
      coalesce(nullif(trim(p_full_name), ''), case when p_email like '%@%' then split_part(p_email,'@',1) else 'AgriMark User' end),
      p_phone,
      v_role
    );

    insert into public.firebase_identities(firebase_uid, profile_id, email)
    values(p_firebase_uid, v_profile_id, p_email)
    on conflict(firebase_uid) do update
      set email = coalesce(excluded.email, public.firebase_identities.email)
      returning profile_id into v_profile_id;
  else
    update public.profiles p
      set full_name = coalesce(p.full_name, nullif(trim(p_full_name), '')),
          phone = coalesce(p.phone, p_phone),
          updated_at = now()
      where p.id = v_profile_id;

    update public.firebase_identities fi
      set email = coalesce(p_email, fi.email), updated_at = now()
      where fi.firebase_uid = p_firebase_uid;
  end if;

  return query
  select p.id, p.full_name, p.phone, p.role, p.created_at, p.updated_at
  from public.profiles p
  where p.id = v_profile_id;
end;
$$;

revoke all on function public.ensure_firebase_identity(text,text,text,text,text) from public;
grant execute on function public.ensure_firebase_identity(text,text,text,text,text) to service_role;

insert into public.crops(name,category) values
 ('Rice','Cereals'), ('Paddy','Cereals'), ('Maize','Cereals'), ('Wheat','Cereals'),
 ('Bajra','Cereals'), ('Ragi','Cereals'), ('Jowar','Cereals'), ('Groundnut','Oilseeds'),
 ('Black Gram','Pulses'), ('Green Gram','Pulses'), ('Red Gram','Pulses'),
 ('Cotton','Cash Crops'), ('Sugarcane','Cash Crops'), ('Tomato','Vegetables'),
 ('Onion','Vegetables'), ('Potato','Vegetables'), ('Chilli','Spices'), ('Turmeric','Spices'),
 ('Banana','Fruits'), ('Coconut','Fruits')
on conflict(name) do nothing;
