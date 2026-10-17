import pytest
from uuid import UUID

from fastapi.testclient import TestClient

from backend.app.core.auth import AuthenticatedUser, get_current_user
from backend.app.core.config import get_settings
from backend.app.core.database import get_supabase
from backend.app.main import app

client = TestClient(app)


def test_core_crops_requires_database_credentials(monkeypatch):
    get_settings.cache_clear()
    get_supabase.cache_clear()
    monkeypatch.setenv("SUPABASE_URL", "")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "")
    try:
        with pytest.raises(RuntimeError, match="No Supabase server credential configured"):
            client.get("/api/v1/core/crops")
    finally:
        get_settings.cache_clear()
        get_supabase.cache_clear()




def test_core_validation_rejects_negative_farm_area():
    user_id = UUID("00000000-0000-0000-0000-000000000000")
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            f"/api/v1/core/profiles/{user_id}/farms",
            headers={"Authorization": "Bearer fake_token"},
            json={"name": "Test", "area_acres": -1},
        )
        assert response.status_code == 422
    finally:
        app.dependency_overrides.clear()




def test_create_farm_returns_saved_database_row(monkeypatch):
    from types import SimpleNamespace
    from backend.app.api.v1 import core

    user_id = UUID("00000000-0000-0000-0000-000000000123")
    farm_id = UUID("00000000-0000-0000-0000-000000000456")
    inserted = {}

    class FakeInsert:
        def insert(self, payload):
            inserted.update(payload)
            return self

        def select(self, columns):
            assert columns == "*"
            return self

        def execute(self):
            return SimpleNamespace(data=[{
                "id": str(farm_id),
                "owner_id": str(user_id),
                "name": inserted["name"],
                "village": inserted["village"],
                "district": inserted["district"],
                "state": inserted["state"],
                "area_acres": inserted["area_acres"],
                "soil_type": inserted["soil_type"],
                "irrigation_source": inserted["irrigation_source"],
            }])

    class FakeDatabase:
        def table(self, name):
            assert name == "farms"
            return FakeInsert()

    monkeypatch.setattr(core, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            f"/api/v1/core/profiles/{user_id}/farms",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "name": "Test Farm",
                "village": "Devapandalam",
                "district": "Kallakurichi",
                "state": "Tamil Nadu",
                "area_acres": 1.2,
                "soil_type": "Black Cotton Soil",
                "irrigation_source": "Borewell",
            },
        )
        assert response.status_code == 201
        assert response.json()["id"] == str(farm_id)
        assert inserted["owner_id"] == str(user_id)
        assert response.json()["area_acres"] == "1.2"
    finally:
        app.dependency_overrides.clear()
