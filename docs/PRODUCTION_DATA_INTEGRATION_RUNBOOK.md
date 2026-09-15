# AgriMark Production Data Integration Runbook

## Scope

This runbook defines the production data integration layer for AgriMark. Supabase PostgreSQL remains the canonical store.

## Authoritative Sources

### Market prices
Use the Government of India Open Government Data (OGD) dataset generated through AGMARKNET for daily commodity/market price observations. Preserve source URL, retrieval timestamp, dataset identifier, commodity, market, min/modal/max price, and source version.

### Weather
Use India Meteorological Department (IMD) APIs where access is available. Preserve request timestamp, location/district, observation/forecast type, provider, and source version. Never silently substitute simulated weather for official observations.

### Schemes and policy
Ingest only from verified official government sources or explicitly authorized feeds. Store source URL, publication date, effective period, retrieval time, document hash, jurisdiction, and source trust classification.

## Ingestion Doctrine

All connectors must:

- run server-side
- validate external payloads
- quarantine malformed records
- preserve provenance
- be idempotent
- use bounded retries
- avoid duplicate canonical records
- distinguish LIVE_OPERATIONAL, FORECAST, SIMULATION, and SYNTHETIC data
- never expose provider credentials to clients

## Data Quality

For every ingestion batch calculate:

- completeness
- duplicate rate
- invalid record count
- stale record count
- source timestamp coverage
- schema validation result

Failed records go to quarantine and do not silently enter production tables.

## Secrets

Provider credentials must be configured through the deployment secret manager. Never commit credentials, API tokens, or private keys.

## Market-price ingestion

Recommended production fields:

source_dataset
source_url
retrieved_at
observed_at
state
district
market
commodity
variety
min_price
modal_price
max_price
unit
currency
source_version
provenance_hash

## Weather ingestion

Recommended production fields:

provider
source_url
retrieved_at
observed_at
forecast_valid_from
forecast_valid_to
latitude
longitude
district
state
temperature
rainfall
humidity
wind
weather_condition
source_version
provenance_hash

## Rollout

1. Validate source contract in staging.
2. Replay a historical sample.
3. Run duplicate and provenance checks.
4. Enable limited production ingestion.
5. Compare source counts and timestamps.
6. Monitor ingestion errors.
7. Expand coverage gradually.

## Safety

Production data must never be fabricated to fill missing source observations. Missing source coverage must be shown explicitly to downstream intelligence and simulation systems.
