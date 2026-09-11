# AgriMark Test Suite Directory

This directory provides root-level access and guidance for running the AgriMark automated test suite.

## Running Tests

From the workspace root directory:

```bash
pytest
```

or targeting backend tests explicitly:

```bash
pytest backend/tests
```

## Test Coverage
- **Authentication & RBAC**: `backend/tests/test_auth.py`
- **Seed & Bio-Intelligence**: `backend/tests/test_bio_intelligence.py`
- **Data Commons & Contracts**: `backend/tests/test_data_commons.py`
- **Farmer Outcomes & Impact**: `backend/tests/test_farmer_outcomes.py`
- **Innovation Sandbox**: `backend/tests/test_innovation_sandbox.py`
- **System Health**: `backend/tests/test_health.py`
- **Final Stages 27–30**: `backend/tests/test_final_stages_27_30.py`
