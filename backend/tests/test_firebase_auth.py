from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.firebase_auth import get_firebase_app, verify_firebase_id_token

client = TestClient(app)


def test_firebase_app_unconfigured_safe_error():
    """Verify that get_firebase_app raises clear ValueError when unconfigured."""
    with patch("backend.app.core.firebase_auth.get_settings") as mock_settings:
        mock_settings.return_value.firebase_service_account_json = None
        mock_settings.return_value.firebase_service_account_json_base64 = None
        mock_settings.return_value.firebase_project_id = None

        with patch("firebase_admin.get_app", side_effect=ValueError("No default app")):
            with pytest.raises(ValueError, match="Firebase Authentication is not configured"):
                get_firebase_app()


def test_verify_firebase_id_token_invalid():
    """Verify that verify_firebase_id_token raises ValueError on invalid token."""
    with patch("backend.app.core.firebase_auth.get_firebase_app") as mock_get_app:
        mock_get_app.return_value = object()
        with patch("firebase_admin.auth.verify_id_token", side_effect=Exception("Invalid token")):
            with pytest.raises(ValueError, match="Invalid or expired Firebase ID token"):
                verify_firebase_id_token("invalid-token")


def test_sync_admin_role_prohibited():
    """Verify POST /auth/firebase/sync rejects self-registration as admin."""
    with patch("backend.app.api.v1.auth_firebase.verify_firebase_id_token") as mock_verify:
        mock_verify.return_value = {"uid": "test-firebase-uid-123", "email": "user@example.com"}

        response = client.post(
            "/api/v1/auth/firebase/sync",
            json={
                "id_token": "valid-token",
                "firebase_uid": "test-firebase-uid-123",
                "email": "user@example.com",
                "requested_role": "admin",
            },
        )
        assert response.status_code == 400
        assert "Self-registration as admin is prohibited" in response.json()["detail"]


def test_sync_uid_mismatch():
    """Verify POST /auth/firebase/sync rejects token UID mismatch."""
    with patch("backend.app.api.v1.auth_firebase.verify_firebase_id_token") as mock_verify:
        mock_verify.return_value = {"uid": "real-uid-999", "email": "user@example.com"}

        response = client.post(
            "/api/v1/auth/firebase/sync",
            json={
                "id_token": "valid-token",
                "firebase_uid": "fake-uid-000",
                "email": "user@example.com",
            },
        )
        assert response.status_code == 401
        assert "Firebase identity mismatch" in response.json()["detail"]
