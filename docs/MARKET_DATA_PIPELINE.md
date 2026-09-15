# AgriMark Market Data Pipeline & Ingestion Specification

## 1. Pipeline Layers
- **Raw**: Unmodified incoming payloads from AGMARKNET / government sources.
- **Normalized**: Data field and unit normalization (e.g. converting Quintal/Tons to KG, currency to INR).
- **Validated**: Validation against mandatory schema fields.
- **Canonical**: Persisted clean reference prices in `market_prices`.
- **Quarantine**: Records failing schema validation are stored in `ingestion_quarantine` with failure reasons.

## 2. Checksum Deduplication
Every record checksum is generated as `${source}-${commodity}-${district}-${observation_date}` to prevent duplicate insertions.
