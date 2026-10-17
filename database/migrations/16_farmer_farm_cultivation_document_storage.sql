-- Farmer data persistence improvements.
-- Existing public.farms, public.farmer_cultivation_records, and public.farmer_documents are canonical.
ALTER TABLE public.farmer_cultivation_records
  ADD COLUMN IF NOT EXISTS crop_name TEXT,
  ADD COLUMN IF NOT EXISTS seed_variety TEXT,
  ADD COLUMN IF NOT EXISTS organic_practice BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budget_inr NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.farmer_documents
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS document_date DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_farms_owner_created ON public.farms(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_cultivation_owner_created ON public.farmer_cultivation_records(farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_cultivation_farm_created ON public.farmer_cultivation_records(farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_documents_user_created ON public.farmer_documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_documents_farm ON public.farmer_documents(farm_id);

ALTER TABLE public.farmer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_cultivation_records ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.farms IS 'Farmer-owned farm registrations submitted through Add Farm.';
COMMENT ON TABLE public.farmer_cultivation_records IS 'Farmer-owned cultivation entries submitted through Record New Cultivation.';
COMMENT ON TABLE public.farmer_documents IS 'Private farmer document metadata. Binary file bytes are stored in private Supabase Storage; file_path stores the object path.';
