from unittest.mock import Mock
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException

from backend.app.core import auth


def _settings():
    return Mock(
        supabase_publishable_key="public-key",
        supabase_service_role_key=None,
        supabase_url="https://example.supabase.co",
        demo_mode=False,
    )


def test_auth_requires_bearer_credentials() -> None:
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user(None)
    assert exc.value.status_code == 401


def test_auth_rejects_non_bearer_scheme() -> None:
    class Credentials:
        scheme = "Basic"
        credentials = "not-a-token"

    # Optional auth deliberately returns None for an unsupported scheme;
    # the required-auth dependency converts that missing identity into 401.
    assert auth.get_optional_current_user(Credentials()) is None
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user(None)
    assert exc.value.status_code == 401


def test_auth_rejects_non_200_supabase_token_response(monkeypatch: pytest.MonkeyPatch) -> None:
    # Invalid Firebase tokens fall through to Supabase token validation.
    monkeypatch.setattr(auth, "verify_firebase_id_token", Mock(side_effect=ValueError("invalid Firebase token")))
    client = Mock()
    client.get.return_value = Mock(status_code=401)
    monkeypatch.setattr(auth, "_auth_client", client)
    monkeypatch.setattr(auth, "get_settings", _settings)

    with pytest.raises(HTTPException) as exc:
        auth.get_optional_current_user(auth.HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad-token"))
    assert exc.value.status_code == 401
    client.get.assert_called_once_with(
        "https://example.supabase.co/auth/v1/user",
        headers={"apikey": "public-key", "Authorization": "Bearer bad-token"},
    )


def test_auth_returns_verified_supabase_user_after_firebase_miss(monkeypatch: pytest.MonkeyPatch) -> None:
    user_id = uuid4()
    response = Mock(status_code=200)
    response.json.return_value = {"id": str(user_id), "role": "authenticated", "email": "farmer@example.com", "phone": "+919000000000"}
    client = Mock()
    client.get.return_value = response
    monkeypatch.setattr(auth, "verify_firebase_id_token", Mock(side_effect=ValueError("not a Firebase token")))
    monkeypatch.setattr(auth, "_auth_client", client)
    monkeypatch.setattr(auth, "get_settings", _settings)

    user = auth.get_optional_current_user(auth.HTTPAuthorizationCredentials(scheme="Bearer", credentials="good-token"))
    assert user is not None
    assert user.id == user_id
    assert user.role == "authenticated"
    assert user.email == "farmer@example.com"
    assert user.phone == "+919000000000"
    client.get.assert_called_once()


def test_auth_rejects_supabase_network_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    client = Mock()
    client.get.side_effect = httpx.ConnectError("offline")
    monkeypatch.setattr(auth, "verify_firebase_id_token", Mock(side_effect=ValueError("not a Firebase token")))
    monkeypatch.setattr(auth, "_auth_client", client)
    monkeypatch.setattr(auth, "get_settings", _settings)

    with pytest.raises(HTTPException) as exc:
        auth.get_optional_current_user(auth.HTTPAuthorizationCredentials(scheme="Bearer", credentials="token"))
    assert exc.value.status_code == 401


def test_auth_get_current_user_accepts_authenticated_user() -> None:
    user_id = uuid4()
    authenticated = auth.AuthenticatedUser(id=user_id, role="farmer", email="farmer@example.com")
    assert auth.get_current_user(authenticated) is authenticated


def test_auth_get_current_user_rejects_missing_identity() -> None:
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user(None)
    assert exc.value.status_code == 401
