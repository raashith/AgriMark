import base64
import json
from functools import lru_cache

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from firebase_admin import get_app, get_apps, initialize_app

from .config import get_settings


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    settings = get_settings()
    if get_apps():
        return get_app()

    if settings.firebase_service_account_json_base64:
        try:
            raw = base64.b64decode(settings.firebase_service_account_json_base64).decode("utf-8")
            return initialize_app(credentials.Certificate(json.loads(raw)))
        except Exception as exc:
            raise RuntimeError("Invalid Firebase base64 service-account configuration") from exc

    if settings.firebase_service_account_json:
        try:
            return initialize_app(credentials.Certificate(json.loads(settings.firebase_service_account_json)))
        except Exception as exc:
            raise RuntimeError("Invalid Firebase service-account configuration") from exc

    raise RuntimeError("Firebase Admin credentials are not configured")


def verify_firebase_id_token(id_token: str) -> dict:
    try:
        return firebase_auth.verify_id_token(id_token, app=get_firebase_app())
    except Exception as exc:
        raise ValueError("Invalid or expired Firebase ID token") from exc
