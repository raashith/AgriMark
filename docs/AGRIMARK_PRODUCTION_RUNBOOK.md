# AgriMark Production Runbook

## Operating System & Service Commands
- **Backend API**: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4`
- **Database Migrations**: `alembic upgrade head`
- **Test Suite**: `pytest backend/tests/ -v`

## Provider Degradation & Fallback Protocol
- When IMD Weather API is unresponsive -> System seamlessly falls back to `HISTORICAL_CLIMATE_NORMALS`.
- When e-NAM Market API is degraded -> System falls back to `STATE_MANDI_PRICE_INDEX_CACHE`.
- When LLM Provider times out -> System degrades gracefully to `DETERMINISTIC_RULE_ENGINE`.
