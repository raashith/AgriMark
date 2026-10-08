-- Public read access for AgriMark's intentionally public catalog/harvest views.
-- Keep writes protected by the existing authenticated/service-role policies.

grant select on table public.crops to anon;
grant select on table public.harvest_batches to anon;
grant select on table public.produce_lots to anon;
grant select on table public.listings to anon;

drop policy if exists crops_public_read on public.crops;
create policy crops_public_read
  on public.crops
  for select
  to anon
  using (true);

drop policy if exists harvest_batches_public_read on public.harvest_batches;
create policy harvest_batches_public_read
  on public.harvest_batches
  for select
  to anon
  using (true);

drop policy if exists produce_lots_public_read on public.produce_lots;
create policy produce_lots_public_read
  on public.produce_lots
  for select
  to anon
  using (true);

drop policy if exists listings_public_read on public.listings;
create policy listings_public_read
  on public.listings
  for select
  to anon
  using (true);
