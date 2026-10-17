-- Farmer record persistence hardening.
-- Production tables already exist; this migration fills the missing agronomy field
-- and adds indexes used by owner-scoped farmer record lists. Safe to re-run.

ALTER TABLE public.farmer_cultivation_records
  ADD COLUMN IF NOT EXISTS agronomy_notes text;

ALTER TABLE public.farmer_documents
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS file_mime_type text,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS file_path text,
  ADD COLUMN IF NOT EXISTS file_name text;

CREATE INDEX IF NOT EXISTS idx_farms_owner_created_at
  ON public.farms (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_cultivation_records_farmer_created_at
  ON public.farmer_cultivation_records (farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_cultivation_records_farm
  ON public.farmer_cultivation_records (farm_id);
CREATE INDEX IF NOT EXISTS idx_farmer_documents_user_created_at
  ON public.farmer_documents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_documents_farm
  ON public.farmer_documents (farm_id);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_cultivation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_documents ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.farms IS 'Farmer-owned farm registration records submitted by Add Farm.';
COMMENT ON TABLE public.farmer_cultivation_records IS 'Farmer-owned crop cultivation records submitted by Record New Cultivation.';
COMMENT ON TABLE public.farmer_documents IS 'Private farmer document metadata; binary files live in the private farmer-documents Storage bucket.';
