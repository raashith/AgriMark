# AgriMark Data Provenance & Lineage Architecture

## Provenance Graph
```
SOURCE -> RAW -> NORMALIZED -> VALIDATED -> CANONICAL -> FEATURE -> FORECAST -> INTELLIGENCE
```

## Mandatory Provenance Fields
- `source`: Source provider identifier
- `source_url`: Official download URI
- `retrieved_at`: ISO timestamp of ingestion
- `license`: Data usage license
- `coverage_start` / `coverage_end`: Temporal scope
- `geography`: Spatial boundary
- `unit`: Measurement unit
- `quality_score`: Multi-dimensional quality index
