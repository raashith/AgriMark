from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_auth_me_requires_authentication():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_root_is_available():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "AgriMark"
