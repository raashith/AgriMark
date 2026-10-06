-- Migration 18: resumable official AGMARKNET ingestion state and idempotency
CREATE TABLE IF NOT EXISTS national_agmarknet_ingestion_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  historical_offset BIGINT NOT NULL DEFAULT 0,
  daily_offset BIGINT NOT NULL DEFAULT 0,
  last_historical_run_at TIMESTAMPTZ,
  last_daily_run_at TIMESTAMPTZ,
  last_historical_total BIGINT,
  last_daily_total BIGINT,
  last_run_status TEXT,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO national_agmarknet_ingestion_state (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS national_agmarknet_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('historical','daily')),
  offset_start BIGINT NOT NULL,
  offset_end BIGINT NOT NULL,
  source_total BIGINT,
  fetched_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  duplicate_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('RUNNING','SUCCESS','FAILED')),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_agmarknet_observation
ON national_market_price_observations
(commodity_code, variant_code, mandi_code, observed_at, source);

CREATE INDEX IF NOT EXISTS idx_agmarknet_ingestion_runs_started
ON national_agmarknet_ingestion_runs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_agmarknet_price_latest
ON national_market_price_observations(commodity_code, state_code, district_code, mandi_code, observed_at DESC);
