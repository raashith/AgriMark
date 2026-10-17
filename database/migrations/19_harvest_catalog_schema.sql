-- Core production tables required by the farmer harvest workflow.
-- The API already validates ownership before writes; these tables must exist in the canonical Supabase project.
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
  area_acres numeric(12,2) default 0 check (area_acres >= 0),
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

create index if not exists idx_farms_owner_id on public.farms(owner_id);
create index if not exists idx_cultivations_farm_id on public.cultivations(farm_id);
create index if not exists idx_harvest_batches_cultivation_id on public.harvest_batches(cultivation_id);
create index if not exists idx_harvest_batches_farm_id on public.harvest_batches(farm_id);
create index if not exists idx_produce_lots_owner_id on public.produce_lots(owner_id);

alter table public.profiles enable row level security;
alter table public.crops enable row level security;
alter table public.farms enable row level security;
alter table public.cultivations enable row level security;
alter table public.harvest_batches enable row level security;
alter table public.produce_lots enable row level security;

drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists farms_owner_access on public.farms;
create policy farms_owner_access on public.farms for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists cultivations_owner_access on public.cultivations;
create policy cultivations_owner_access on public.cultivations for all to authenticated
using (exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid())))
with check (exists (select 1 from public.farms f where f.id = farm_id and f.owner_id = (select auth.uid())));
drop policy if exists lots_owner_access on public.produce_lots;
create policy lots_owner_access on public.produce_lots for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists crops_public_read on public.crops;
create policy crops_public_read on public.crops for select to anon, authenticated using (true);
drop policy if exists harvest_batches_public_read on public.harvest_batches;
create policy harvest_batches_public_read on public.harvest_batches for select to anon, authenticated using (true);
drop policy if exists produce_lots_public_read on public.produce_lots;
create policy produce_lots_public_read on public.produce_lots for select to anon, authenticated using (true);

grant select on public.crops, public.harvest_batches, public.produce_lots to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.farms, public.cultivations, public.harvest_batches, public.produce_lots to authenticated;

insert into public.crops (name, category) values
 ('Rice','Cereals'), ('Paddy','Cereals'), ('Maize','Cereals'), ('Wheat','Cereals'),
 ('Bajra','Cereals'), ('Ragi','Cereals'), ('Jowar','Cereals'), ('Groundnut','Oilseeds'),
 ('Black Gram','Pulses'), ('Green Gram','Pulses'), ('Red Gram','Pulses'),
 ('Cotton','Cash Crops'), ('Sugarcane','Cash Crops'), ('Tomato','Vegetables'),
 ('Onion','Vegetables'), ('Potato','Vegetables'), ('Chilli','Spices'), ('Turmeric','Spices'),
 ('Banana','Fruits'), ('Coconut','Fruits')
on conflict (name) do nothing;
