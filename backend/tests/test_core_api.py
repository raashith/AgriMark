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
    with pytest.raises(RuntimeError, match="No Supabase server credential configured"):
        client.get("/api/v1/core/crops")
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


