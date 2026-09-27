import base64
import json
import logging
from functools import lru_cache

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from .config import get_settings

logger = logging.getLogger("agrimark.firebase_auth")


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    try:
        app = firebase_admin.get_app()
        logger.info("Using existing Firebase Admin app for project: %s", getattr(app, "project_id", "agrimark-c1181"))
        return app
    except ValueError:
        pass

    settings = get_settings()

    if settings.firebase_service_account_json_base64:
        try:
            raw = base64.b64decode(settings.firebase_service_account_json_base64).decode("utf-8")
            service_account = json.loads(raw)
            project_id = service_account.get("project_id", "agrimark-c1181")
            app = firebase_admin.initialize_app(credentials.Certificate(service_account))
            logger.info("Firebase Admin initialized via SERVICE_ACCOUNT_JSON_BASE64 for project: %s", project_id)
            return app
        except Exception as exc:
            logger.error("Failed to initialize Firebase Admin via BASE64 JSON: %s", exc)
            raise ValueError(f"Invalid FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 configuration: {exc}") from exc

    if settings.firebase_service_account_json:
        try:
            service_account = json.loads(settings.firebase_service_account_json)
            project_id = service_account.get("project_id", "agrimark-c1181")
            app = firebase_admin.initialize_app(credentials.Certificate(service_account))
            logger.info("Firebase Admin initialized via SERVICE_ACCOUNT_JSON for project: %s", project_id)
            return app
        except Exception as exc:
            logger.error("Failed to initialize Firebase Admin via JSON: %s", exc)
            raise ValueError(f"Invalid FIREBASE_SERVICE_ACCOUNT_JSON configuration: {exc}") from exc

    if settings.firebase_project_id:
        app = firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})
        logger.info("Firebase Admin initialized via FIREBASE_PROJECT_ID: %s", settings.firebase_project_id)
        return app

    logger.warning("Firebase Authentication environment variables missing on server.")
    raise ValueError(
        "Firebase Authentication is not configured on the server. "
        "Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, or FIREBASE_PROJECT_ID."
    )


def verify_firebase_id_token(id_token: str) -> dict:
    try:
        app = get_firebase_app()
        return firebase_auth.verify_id_token(id_token, app=app)
    except firebase_auth.ExpiredIdTokenError as exc:
        logger.warning("Firebase ID token expired: %s", exc)
        raise ValueError("Invalid or expired Firebase ID token") from exc
    except firebase_auth.InvalidIdTokenError as exc:
        logger.warning("Firebase ID token invalid: %s", exc)
        raise ValueError("Invalid or expired Firebase ID token") from exc
    except firebase_auth.RevokedIdTokenError as exc:
        logger.warning("Firebase ID token revoked: %s", exc)
        raise ValueError("Invalid or expired Firebase ID token") from exc
    except firebase_auth.CertificateFetchError as exc:
        logger.error("Failed to fetch Google public certificates for token verification: %s", exc)
        raise ValueError("Invalid or expired Firebase ID token") from exc
    except ValueError as val_err:
        raise val_err
    except Exception as exc:
        logger.error("Unhandled exception verifying Firebase ID token: %s", exc)
        raise ValueError("Invalid or expired Firebase ID token") from exc
