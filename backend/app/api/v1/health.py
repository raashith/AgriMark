from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import APIRouter, Depends
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.schemas.health import HealthCheckResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthCheckResponse)
def get_health_status(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    return HealthCheckResponse(
        status="ok",
        version=settings.VERSION,
        environment=settings.ENV,
        database=db_status,
        timestamp=datetime.utcnow()
    )


@router.get("/db")
def get_db_health(db: Session = Depends(get_db)):
    dialect_name = db.bind.dialect.name if db.bind else "unknown"
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "dialect": dialect_name,
            "is_sqlite_fallback": dialect_name == "sqlite",
            "environment": settings.ENV,
            "database_env": settings.DATABASE_ENV,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "dialect": dialect_name,
            "error": str(e),
            "timestamp": datetime.utcnow()
        }
