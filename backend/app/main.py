from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

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
    allow_headers=["*"],
)



@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    safe_errors = [
        {"loc": list(err.get("loc", ())), "msg": err.get("msg"), "type": err.get("type")}
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid request parameters", "errors": safe_errors},
    )



@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "AgriMark server is temporarily unavailable. Please try again."},
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
