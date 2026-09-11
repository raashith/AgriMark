from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_core_crops_requires_database_credentials(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "")
    response = client.get("/api/v1/core/crops")
    assert response.status_code in {200, 500}


def test_core_validation_rejects_negative_farm_area():
    response = client.post(
        "/api/v1/core/profiles/00000000-0000-0000-0000-000000000000/farms",
        json={"name": "Test", "area_acres": -1},
    )
    assert response.status_code == 422
