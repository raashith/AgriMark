from unittest.mock import Mock
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException

from backend.app.core import auth


def test_auth_requires_bearer_credentials() -> None:
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user(None)
    assert exc.value.status_code == 401


def test_auth_rejects_non_200_token_response(monkeypatch: pytest.MonkeyPatch) -> None:
    client = Mock()
    client.get.return_value = Mock(status_code=401)
    monkeypatch.setattr(auth, "_auth_client", client)
    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Mock(supabase_publishable_key="public-key", supabase_service_role_key=None, supabase_url="https://example.supabase.co"),
    )
    credentials = auth.HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad-token")
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user(credentials)
    assert exc.value.status_code == 401


def test_auth_returns_verified_user(monkeypatch: pytest.MonkeyPatch) -> None:
    user_id = uuid4()
    response = Mock(status_code=200)
    response.json.return_value = {"id": str(user_id), "role": "authenticated", "email": "farmer@example.com"}
    client = Mock()
    client.get.return_value = response
    monkeypatch.setattr(auth, "_auth_client", client)
    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Mock(supabase_publishable_key="public-key", supabase_service_role_key=None, supabase_url="https://example.supabase.co"),
    )
    credentials = auth.HTTPAuthorizationCredentials(scheme="Bearer", credentials="good-token")
    user = auth.get_current_user(credentials)
    assert user.id == user_id
    assert user.role == "authenticated"
    assert user.email == "farmer@example.com"
    client.get.assert_called_once()


def test_auth_maps_http_errors_to_401(monkeypatch: pytest.MonkeyPatch) -> None:
    client = Mock()
    client.get.side_effect = httpx.ConnectError("offline")
    monkeypatch.setattr(auth, "_auth_client", client)
    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Mock(supabase_publishable_key="public-key", supabase_service_role_key=None, supabase_url="https://example.supabase.co"),
    )
    credentials = auth.HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user(credentials)
    assert exc.value.status_code == 401
