from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.database import get_supabase

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


def _read_source(name: str, operation, errors: list[str]) -> Any:
    try:
        return operation()
    except Exception:
        # Keep internal database details in server logs only; return a safe source
        # label to the admin UI so missing tables and access issues are actionable.
        logger.exception("Admin operations overview source failed: %s", name)
        errors.append(name)
        return None


def _count(table: str, status: str | None = None, role: str | None = None) -> int:
    query = get_supabase().table(table).select("id", count="exact", head=True)
    if status is not None:
        query = query.eq("status", status)
    if role is not None:
        query = query.eq("role", role)
    result = query.execute()
    if getattr(result, "error", None):
        raise RuntimeError(f"Unable to count {table}")
    if result.count is None:
        raise RuntimeError(f"Count unavailable for {table}")
    return int(result.count)


def _rows(table: str, columns: str, limit: int = 6) -> list[dict[str, Any]]:
    result = (
        get_supabase()
        .table(table)
        .select(columns, count="exact")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    if getattr(result, "error", None):
        raise RuntimeError(f"Unable to read {table}")
    return result.data or []


@router.get("/operations/overview")
def operations_overview(user: AuthenticatedUser = Depends(get_current_user)):
    """Return minimal, real operational metrics for the authenticated admin only."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")

    errors: list[str] = []
    users = _read_source("profiles", lambda: _count("profiles"), errors)
    farmers = _read_source("farmer_profiles", lambda: _count("profiles", role="farmer"), errors)
    active_listings = _read_source("listings", lambda: _count("listings", status="active"), errors)

    order_result = _read_source(
        "marketplace_orders",
        lambda: (
            _count("marketplace_orders"),
            _rows("marketplace_orders", "id,status,created_at"),
        ),
        errors,
    )
    orders_count = order_result[0] if order_result is not None else None
    recent_orders = order_result[1] if order_result is not None else []

    recent_listings = _read_source(
        "recent_listings",
        lambda: _rows("listings", "id,title,status,created_at"),
        errors,
    )
    audit_events = _read_source(
        "admin_audit_log",
        lambda: _rows("admin_audit_log", "id,action,created_at"),
        errors,
    )

    def latest_observation():
        result = (
            get_supabase()
            .table("national_market_price_observations")
            .select("observation_date")
            .order("observation_date", desc=True)
            .limit(1)
            .execute()
        )
        if getattr(result, "error", None):
            raise RuntimeError("Unable to read market data freshness")
        return (result.data or [{}])[0].get("observation_date")

    latest_market_date = _read_source("national_market_price_observations", latest_observation, errors)

    return {
        "metrics": {
            "users": users,
            "farmers": farmers,
            "active_listings": active_listings,
            "orders": orders_count,
        },
        "recent_listings": recent_listings or [],
        "recent_orders": recent_orders,
        "audit_events": audit_events or [],
        "latest_market_date": latest_market_date,
        "source_errors": sorted(set(errors)),
    }
