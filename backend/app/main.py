from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.ai import router as ai_router
from .api.v1.ai_chat import router as ai_chat_router
from .api.v1.auth import router as auth_router
from .api.v1.core import router as core_router
from .api.v1.health import router as health_router
from .api.v1.marketplace import router as marketplace_router
from .api.v1.readiness import router as readiness_router
from .api.v1.tracking import router as tracking_router
from .core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin"],
)
app.include_router(health_router, prefix="/api/v1")
app.include_router(readiness_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(ai_chat_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(core_router, prefix="/api/v1")
app.include_router(marketplace_router, prefix="/api/v1")
app.include_router(tracking_router, prefix="/api/v1")


@app.get("/")
@app.head("/")
def root() -> dict[str, str]:
    return {"name": "AgriMark", "status": "ok", "docs": "/docs", "api": "/api/v1"}
