# AgriMark Policy Data Quality & Synthetic Isolation

## Synthetic Data Protocol
All non-production test policy records generated for load or staging tests are marked with `data_origin = 'SYNTHETIC'`.

## Production Filtering
Production policy API handlers reject all records containing `data_origin = 'SYNTHETIC'` to ensure zero leakage of simulated policy data into farmer decision workflows.
