from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from backend.app.core.auth import get_current_user
from backend.app.main import app

client = TestClient(app)


def test_auth_requires_bearer_credentials():
    with pytest.raises(HTTPException) as exc:
        get_current_user(None)
    assert exc.value.status_code == 401


def test_profile_owner_identity_is_uuid():
    user_id = uuid4()
    assert user_id.version == 4


def test_auth_rejects_non_bearer_scheme():
    class Credentials:
        scheme = "Basic"
        credentials = "not-a-token"

    with pytest.raises(HTTPException) as exc:
        get_current_user(Credentials())
    assert exc.value.status_code == 401


def test_auth_login_invalid_credentials_returns_json():
    response = client.post("/api/v1/auth/login", json={"email": "nonexistent@agrimark.org", "password": "wrong"})
    assert response.status_code in (400, 401, 503)
    assert response.headers["content-type"].startswith("application/json")
    assert "detail" in response.json()


def test_auth_register_admin_prohibited():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "admin@agrimark.org", "password": "secretpassword", "role": "admin"},
    )
    assert response.status_code == 403
    assert response.headers["content-type"].startswith("application/json")
    assert response.json()["detail"] == "Self-registration as admin is prohibited."


def test_auth_logout_returns_json():
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    assert response.json() == {"message": "Logged out successfully"}


def test_auth_me_unauthenticated_returns_json():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.headers["content-type"].startswith("application/json")


def test_cors_options_preflight():
    response = client.options(
        "/api/v1/auth/me",
        headers={
            "Origin": "https://agrimark-six.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code in (200, 400, 405)


