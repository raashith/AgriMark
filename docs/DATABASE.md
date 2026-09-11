# AgriMark Database Infrastructure Guide

## 1. Primary Standard: PostgreSQL / Supabase
AgriMark uses **PostgreSQL 14+ / Supabase** as its primary production relational database engine.

- **Connection URL Format**:
  `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres`
- **ORM**: SQLAlchemy 2.0 (Async enabled)
- **Migrations Framework**: Alembic

## 2. Migration History (Alembic)
1. `001_initial_schema.py` — Core users, roles, farms, crops, harvests, produce lots, listings, orders
2. `014_stage_23_commons_schema.py` — Data commons providers, consumers, contracts, consent policies
3. `015_stage_24_sandbox_schema.py` — Innovation sandbox projects, synthetic datasets, developer keys
4. `016_stage_25_outcomes_schema.py` — Farmer economic profiles, baseline interventions, impact evaluations
5. `017_stage_26_bio_schema.py` — Seed varieties, germplasm traits, GxE trials, bio-inputs
6. `018_stage_27_logistics_processing_schema.py` — Facilities, reefer telemetry, transport bookings
7. `019_stage_28_finance_allied_schema.py` — Credit evaluations, livestock & fisheries records
8. `020_stage_29_trade_climate_resilience_schema.py` — Trade passes, circular waste, Disaster Mode events

## 3. Local Testing Engine: SQLite Fallback
For zero-dependency unit and CI testing, `backend/app/core/database.py` falls back gracefully to SQLite in-memory (`sqlite:///:memory:`) when PostgreSQL is unconfigured or unreachable.
