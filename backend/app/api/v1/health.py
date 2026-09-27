from fastapi import APIRouter

from ...core.config import get_settings
from ...core.database import get_supabase
from ...schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    database = "ok"
    try:
        get_supabase().table("profiles").select("id", count="exact").limit(1).execute()
    except Exception:
        database = "degraded"

    firebase_configured = bool(
        settings.firebase_service_account_json
        or settings.firebase_service_account_json_base64
        or settings.firebase_project_id
    )

    return HealthResponse(
        status="ok" if database == "ok" else "degraded",
        service=settings.app_name,
        database=database,
        firebase="configured" if firebase_configured else "not_configured",
        ai="configured" if getattr(settings, "openai_api_key", None) else "not_configured",
    )
