-- Optional fields used by the Record New Cultivation form.
-- Existing canonical tables and rows are preserved.
ALTER TABLE public.farmer_cultivation_records
  ADD COLUMN IF NOT EXISTS planting_method TEXT,
  ADD COLUMN IF NOT EXISTS fertilizer_plan TEXT,
  ADD COLUMN IF NOT EXISTS pesticide_plan TEXT,
  ADD COLUMN IF NOT EXISTS irrigation_plan TEXT,
  ADD COLUMN IF NOT EXISTS soil_test_document_id UUID,
  ADD COLUMN IF NOT EXISTS photos TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.farmer_cultivation_records.planting_method IS
  'Planting or sowing method selected by the farmer.';
COMMENT ON COLUMN public.farmer_cultivation_records.fertilizer_plan IS
  'Farmer-provided fertilizer or nutrient plan.';
COMMENT ON COLUMN public.farmer_cultivation_records.pesticide_plan IS
  'Farmer-provided pest and disease management plan.';
COMMENT ON COLUMN public.farmer_cultivation_records.irrigation_plan IS
  'Farmer-provided irrigation plan for this cultivation.';
COMMENT ON COLUMN public.farmer_cultivation_records.soil_test_document_id IS
  'Optional reference to a soil-test document in public.farmer_documents.';
COMMENT ON COLUMN public.farmer_cultivation_records.photos IS
  'Private Storage object paths for cultivation photos; do not store public URLs.';
