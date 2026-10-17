CREATE TABLE IF NOT EXISTS public.national_agmarknet_ingestion_state (
  id integer PRIMARY KEY CHECK (id = 1),
  historical_offset bigint NOT NULL DEFAULT 0 CHECK (historical_offset >= 0),
  daily_offset bigint NOT NULL DEFAULT 0 CHECK (daily_offset >= 0),
  last_historical_total bigint CHECK (last_historical_total IS NULL OR last_historical_total >= 0),
  last_daily_total bigint CHECK (last_daily_total IS NULL OR last_daily_total >= 0),
  last_historical_run_at timestamptz,
  last_daily_run_at timestamptz,
  last_run_status text NOT NULL DEFAULT 'NEVER_RUN' CHECK (last_run_status IN ('NEVER_RUN','SUCCESS','FAILED')),
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.national_agmarknet_ingestion_state (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.national_agmarknet_ingestion_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.national_agmarknet_ingestion_state FROM anon, authenticated;
GRANT ALL ON public.national_agmarknet_ingestion_state TO service_role;