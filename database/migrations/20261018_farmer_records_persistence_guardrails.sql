-- AgriMark farmer-owned record persistence guardrails.
-- Reuse existing canonical tables: farms, farmer_cultivation_records, farmer_documents.
ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS irrigation_source TEXT,
  ADD COLUMN IF NOT EXISTS soil_type TEXT;

ALTER TABLE public.farmer_cultivation_records
  ADD COLUMN IF NOT EXISTS crop_name TEXT,
  ADD COLUMN IF NOT EXISTS seed_variety TEXT,
  ADD COLUMN IF NOT EXISTS organic_practice BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budget_inr NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS agronomy_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.farmer_documents
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS document_date DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS file_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_farms_owner_created_guard
  ON public.farms(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_cultivation_owner_created_guard
  ON public.farmer_cultivation_records(farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_cultivation_farm_created_guard
  ON public.farmer_cultivation_records(farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_documents_user_created_guard
  ON public.farmer_documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_documents_farm_guard
  ON public.farmer_documents(farm_id);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_cultivation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_documents ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.farms IS 'Farmer-owned farm registrations submitted through Add Farm.';
COMMENT ON TABLE public.farmer_cultivation_records IS 'Farmer-owned cultivation entries submitted through Record New Cultivation.';
COMMENT ON TABLE public.farmer_documents IS 'Private farmer document metadata; document bytes live in the private farmer-documents Storage bucket; file_path stores the private object path.';
