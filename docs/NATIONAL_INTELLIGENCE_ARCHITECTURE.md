# AgriMark Phase 10 - National Agricultural Intelligence Architecture

## Overview
AgriMark Phase 10 builds the canonical backend data model and intelligence engine foundation for a national-scale agricultural intelligence platform in India.

## Data Layers
1. **RAW**: Immutable raw ingestion payloads.
2. **NORMALIZED**: Standardized schema across diverse sources.
3. **VALIDATED**: High-quality records passing quality rules. Invalid records quarantined in `national_data_quarantine`.
4. **CANONICAL**: Core entity states in PostgreSQL.
5. **FEATURE**: Engineered feature variables for MLOps pipelines.
6. **FORECAST**: Probabilistic predictions with 95% confidence intervals.
7. **INTELLIGENCE**: Aggregated composite insights and indicators.

## Privacy & Security
- Public national APIs strip all PII (phone numbers, exact farm GPS coordinates, financial details).
- Row Level Security (RLS) policies enforce data isolation and access controls.
