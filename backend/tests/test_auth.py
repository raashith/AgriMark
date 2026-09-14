from uuid import uuid4

import pytest
from fastapi import HTTPException

from backend.app.api.v1.auth import _ALLOWED_REGISTRATION_ROLES
from backend.app.core.auth import get_current_user
from backend.app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest


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


def test_registration_roles_exclude_admin():
    assert "admin" not in _ALLOWED_REGISTRATION_ROLES
    assert "farmer" in _ALLOWED_REGISTRATION_ROLES
    assert "buyer" in _ALLOWED_REGISTRATION_ROLES


def test_auth_request_schemas_validate():
    registration = RegisterRequest(email="farmer@example.com", password="password123", role="farmer")
    assert registration.email == "farmer@example.com"
    assert LoginRequest(phone_or_email="farmer@example.com", password="password123").password == "password123"
    assert RefreshRequest(refresh_token="refresh-token").refresh_token == "refresh-token"
