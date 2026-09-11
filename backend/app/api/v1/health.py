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
