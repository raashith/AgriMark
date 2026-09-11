# AgriMark Machine Learning (ML) Subsystem

The AgriMark ML subsystem provides price intelligence, yield forecasting, and demand predictions for key commodities.

## Architecture

- **Primary Service**: Implemented in [`backend/app/services/ml_prediction_service.py`](file:///d:/AgriMark/backend/app/services/ml_prediction_service.py)
- **Supported Commodities**: Tomato, Onion, Potato
- **Forecasting Horizons**: 1-day, 7-day, 14-day, 30-day
- **Features**:
  - Weather context (IMD temperature & rainfall)
  - Historical APMC mandi prices (Agmarknet data)
  - Crop cultivation stage & seasonal factors
  - Uncertainty estimation & provenance logging

## Data Provenance & Safety
Every prediction record stores:
- `model_name`
- `model_version`
- `dataset_version`
- `feature_version`
- `timestamp`
- `uncertainty_bounds`
- `evidence_status` (`OBSERVED`, `PREDICTED`, `ESTIMATED`)
