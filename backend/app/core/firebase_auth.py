import base64
import json
from functools import lru_cache

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from .config import get_settings


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    settings = get_settings()

    if firebase_admin._apps:
        return firebase_admin.get_app()

    if settings.firebase_service_account_json_base64:
        raw = base64.b64decode(settings.firebase_service_account_json_base64).decode("utf-8")
        service_account = json.loads(raw)
        return firebase_admin.initialize_app(credentials.Certificate(service_account))

    if settings.firebase_service_account_json:
        service_account = json.loads(settings.firebase_service_account_json)
        return firebase_admin.initialize_app(credentials.Certificate(service_account))

    return firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})


def verify_firebase_id_token(id_token: str) -> dict:
    try:
        get_firebase_app()
        return firebase_auth.verify_id_token(id_token)
    except Exception as exc:
        raise ValueError("Invalid or expired Firebase ID token") from exc
