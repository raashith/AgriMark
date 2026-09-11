from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...core.auth import get_current_user
from ...core.database import get_supabase

router = APIRouter(prefix="/tracking", tags=["tracking"])


class LocationPoint(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    captured_at: datetime | None = None
    accuracy_m: float | None = Field(default=None, ge=0)
    speed_mps: float | None = Field(default=None, ge=0)
    heading_deg: float | None = Field(default=None, ge=0, le=360)
    payload: dict[str, Any] = Field(default_factory=dict)


@router.post("/location", status_code=201)
def record_location(point: LocationPoint) -> dict[str, Any]:
    user = get_current_user()
    row = {
        "user_id": str(user.id),
        "latitude": point.latitude,
        "longitude": point.longitude,
        "captured_at": point.captured_at.isoformat() if point.captured_at else None,
        "accuracy_m": point.accuracy_m,
        "speed_mps": point.speed_mps,
        "heading_deg": point.heading_deg,
        "payload": point.payload,
    }
    try:
        result = (
            get_supabase()
            .table("location_telemetry")
            .insert(row)
            .select("id,captured_at,latitude,longitude,accuracy_m,speed_mps,heading_deg,payload")
            .single()
            .execute()
        )
        return result.data
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Could not record location telemetry") from exc


@router.get("/latest")
def latest_location() -> dict[str, Any]:
    user = get_current_user()
    try:
        result = (
            get_supabase()
            .table("location_telemetry")
            .select("id,captured_at,latitude,longitude,accuracy_m,speed_mps,heading_deg,payload")
            .eq("user_id", str(user.id))
            .order("captured_at", desc=True)
            .limit(1)
            .execute()
        )
        return {"location": result.data[0] if result.data else None}
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Could not read latest location") from exc
