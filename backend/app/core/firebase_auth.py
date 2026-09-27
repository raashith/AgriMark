import base64
import json
from functools import lru_cache

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from .config import get_settings


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    try:
        return firebase_admin.get_app()
    except ValueError:
        pass

    settings = get_settings()

    if settings.firebase_service_account_json_base64:
        try:
            raw = base64.b64decode(settings.firebase_service_account_json_base64).decode("utf-8")
            service_account = json.loads(raw)
            return firebase_admin.initialize_app(credentials.Certificate(service_account))
        except Exception as exc:
            raise ValueError(f"Invalid FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 configuration: {exc}") from exc

    if settings.firebase_service_account_json:
        try:
            service_account = json.loads(settings.firebase_service_account_json)
            return firebase_admin.initialize_app(credentials.Certificate(service_account))
        except Exception as exc:
            raise ValueError(f"Invalid FIREBASE_SERVICE_ACCOUNT_JSON configuration: {exc}") from exc

    if settings.firebase_project_id:
        return firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})

    raise ValueError(
        "Firebase Authentication is not configured on the server. "
        "Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, or FIREBASE_PROJECT_ID."
    )


def verify_firebase_id_token(id_token: str) -> dict:
    try:
        app = get_firebase_app()
        return firebase_auth.verify_id_token(id_token, app=app)
    except ValueError as val_err:
        raise val_err
    except Exception as exc:
        raise ValueError("Invalid or expired Firebase ID token") from exc
