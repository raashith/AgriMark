# AgriMark Production Data Integrations

## Purpose
Canonical plan for connecting AgriMark to verified agricultural data sources without mock production data.

## Authoritative Sources
- AGMARKNET / India Open Government Data: daily mandi commodity minimum, modal and maximum prices and market metadata.
- India Meteorological Department (IMD): current weather, forecasts, district rainfall, nowcasts, AWS/ARG and agromet advisory feeds where access is available.

## Rules
1. External data is ingested server-side only.
2. Each observation stores source, source URL or provider identifier, retrieval time, observation time, parser version and provenance status.
3. Live data is never mixed with synthetic or simulation records.
4. Upserts are idempotent using a provider observation key.
5. Failed or malformed records are quarantined.
6. API credentials are runtime secrets and never committed to Git.
7. Existing Supabase tables remain canonical; no second primary database is introduced.

## Current production gap
The existing application has the canonical tables and UI/data-service access patterns, but production table populations remain sparse. Live ingestion credentials and provider contracts must be configured before scheduled ingestion can populate them.

## Required ingestion jobs
- Mandi daily price/arrival synchronization.
- Weather/current conditions synchronization.
- District forecast and rainfall synchronization.
- Source health and stale-data checks.

## Validation
Each connector must include schema validation, retry/backoff, rate-limit handling, source timestamps, duplicate protection and metrics for fetched, accepted, quarantined and failed records.
