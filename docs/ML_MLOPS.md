# AgriMark ML & MLOps Architecture

## 1. Forecasting Services
The Machine Learning forecasting engine is implemented in `backend/app/services/ml_prediction_service.py`.

## 2. Commodities & Horizons
- **Target Commodities**: Tomato, Onion, Potato
- **Horizons**: 1-day, 7-day, 14-day, 30-day

## 3. Data Inputs & Feature Engineering
- **Mandi Price Trends**: Historical Agmarknet APMC price indices
- **Weather Telemetry**: IMD rainfall, humidity, and temperature data
- **Crop Context**: Sowing date, phenological stage, regional acreage

## 4. Provenance & Reproducibility Tracking
Every prediction stores:
- `model_name` & `model_version`
- `dataset_version` & `feature_version`
- `prediction_timestamp`
- `uncertainty_bounds`
- `evidence_status` (`OBSERVED`, `PREDICTED`, `ESTIMATED`)
