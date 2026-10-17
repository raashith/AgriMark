-- Farmer data persistence: secure document storage and indexes.
-- The application reuses existing farms, farmer_cultivation_records and
-- farmer_documents tables rather than creating overlapping records tables.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'farmer-documents',
  'farmer-documents',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create index if not exists farmer_cultivation_records_crop_id_idx
  on public.farmer_cultivation_records (crop_id);
create index if not exists farmer_cultivation_records_farmer_created_idx
  on public.farmer_cultivation_records (farmer_id, created_at desc);
create index if not exists farmer_cultivation_records_farm_idx
  on public.farmer_cultivation_records (farm_id);
create index if not exists farmer_documents_user_created_idx
  on public.farmer_documents (user_id, created_at desc);
create index if not exists farmer_documents_farm_idx
  on public.farmer_documents (farm_id);

drop policy if exists "Farmer documents storage insert own" on storage.objects;
create policy "Farmer documents storage insert own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'farmer-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Farmer documents storage read own" on storage.objects;
create policy "Farmer documents storage read own"
on storage.objects for select to authenticated
using (
  bucket_id = 'farmer-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Farmer documents storage update own" on storage.objects;
create policy "Farmer documents storage update own"
on storage.objects for update to authenticated
using (
  bucket_id = 'farmer-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'farmer-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Farmer documents storage delete own" on storage.objects;
create policy "Farmer documents storage delete own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'farmer-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant select, insert, update, delete on public.farms to authenticated;
grant select, insert, update, delete on public.farmer_cultivation_records to authenticated;
grant select, insert, update, delete on public.farmer_documents to authenticated;
