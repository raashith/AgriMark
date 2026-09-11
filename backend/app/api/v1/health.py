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
    return HealthResponse(
        status="ok" if database == "ok" else "degraded",
        service=settings.app_name,
        database=database,
        ai="configured" if settings.openai_api_key else "not_configured",
    )
