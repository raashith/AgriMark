from fastapi import APIRouter
from starlette.responses import JSONResponse

from ...core.database import get_supabase
from ...core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/ready", response_model=None)
def readiness() -> JSONResponse:
    settings = get_settings()
    checks: dict[str, str] = {}

    try:
        get_supabase().table("profiles").select("id", count="exact").limit(1).execute()
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "degraded"

    checks["ai"] = "configured" if settings.openai_api_key else "not_configured"
    ready = checks["database"] == "ok" and checks["ai"] == "configured"

    return JSONResponse(
        status_code=200 if ready else 503,
        content={
            "status": "ready" if ready else "not_ready",
            "checks": checks,
        },
    )
