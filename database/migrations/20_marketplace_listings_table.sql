-- Marketplace listing table required by backend/app/api/v1/core.py.
-- Public clients may read active listings; privileged writes remain server-side.
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.produce_lots(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  price_per_unit numeric(14,2) not null check (price_per_unit >= 0),
  currency text not null default 'INR',
  min_order_quantity numeric(14,3) not null default 1 check (min_order_quantity > 0),
  status text not null default 'active' check (status in ('active','paused','sold','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status_created_at on public.listings(status, created_at desc);
create index if not exists idx_listings_seller_id on public.listings(seller_id);
create index if not exists idx_listings_lot_id on public.listings(lot_id);

alter table public.listings enable row level security;

drop policy if exists listings_public_active_read on public.listings;
create policy listings_public_active_read on public.listings
  for select to anon, authenticated using (status = 'active' or seller_id = auth.uid());

drop policy if exists listings_seller_manage on public.listings;
create policy listings_seller_manage on public.listings
  for all to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant all on public.listings to service_role;
