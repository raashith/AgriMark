# Production Data Integration Status

## Verified external sources

- Government of India Open Government Data (OGD) Platform: current daily mandi commodity prices generated through AGMARKNET.
- India Meteorological Department (IMD): current weather, district forecasts, rainfall, nowcast, AWS/ARG and Agromet APIs.

## Integration status

The production connector architecture is documented, but provider credentials and external API contracts must be configured per deployment environment before live ingestion is enabled.

## Required environment configuration

MARKET_DATA_PROVIDER
MARKET_DATA_API_URL
MARKET_DATA_API_KEY (when required by provider)
IMD_API_URL
IMD_API_KEY (when required by provider)
INGESTION_CRON_SECRET

Do not commit secrets.

## Validation requirements

Every connector must preserve source URL, retrieval timestamp, observed timestamp, jurisdiction/location, provider, source version and provenance hash. Invalid or stale records must be quarantined or marked stale rather than silently replacing live observations.
