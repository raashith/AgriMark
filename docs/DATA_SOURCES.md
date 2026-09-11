# AgriMark Data Sources & External Integrations

## 1. Provider Adapter Architecture
AgriMark uses adapter-based connectors with fallback handlers to integrate external data sources cleanly.

## 2. Integrated Data Sources
- **IMD (India Meteorological Department)**: Weather telemetry, rainfall predictions, extreme event alerts.
- **Agmarknet (data.gov.in)**: APMC mandi arrival volumes and spot prices.
- **ISRO / Bhuvan**: Satellite vegetation indices (NDVI) and soil moisture context.
- **e-NAM**: Electronic national agriculture market trade price indices.

## 3. Health & Fallback Registry
`ProviderHealthRegistry` (`backend/app/services/provider_health_registry.py`) monitors external API freshness, response latency, and error rates, switching smoothly to deterministic fallback models if an external provider API is offline.
