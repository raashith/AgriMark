import logging
from decimal import Decimal, InvalidOperation
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.database import get_supabase

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)

_PAGE_SIZE = 1000
_CANCELLED_ORDER_STATUSES = {"cancelled", "canceled", "rejected"}
_ACTIVE_ORDER_STATUSES = {"placed", "pending", "confirmed", "accepted", "processing", "dispatched", "in_transit"}
_COMPLETED_ORDER_STATUSES = {"delivered", "completed"}


def _fetch_all(query: Any) -> list[dict[str, Any]]:
    """Fetch every matching row in bounded pages rather than silently stopping at PostgREST's row cap."""
    rows: list[dict[str, Any]] = []
    start = 0
    while True:
        page = query.range(start, start + _PAGE_SIZE - 1).execute()
        page_rows = page.data or []
        rows.extend(dict(row) for row in page_rows)
        if len(page_rows) < _PAGE_SIZE:
            return rows
        start += _PAGE_SIZE


def _as_decimal(value: Any) -> Decimal:
    if value is None:
        return Decimal("0")
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return Decimal("0")


def _document_status(statuses: list[str]) -> str:
    normalized = {str(value or "").strip().lower() for value in statuses}
    if "verified" in normalized:
        return "verified"
    if "rejected" in normalized and not (normalized - {"rejected"}):
        return "rejected"
    if normalized:
        return "pending"
    return "not_submitted"


@router.get("/dashboard-summary")
def get_admin_dashboard_summary(
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Return platform-wide dashboard metrics only to an application administrator."""
    if str(user.role or "").strip().lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )

    try:
        db = get_supabase()
        profiles = _fetch_all(
            db.table("profiles")
            .select("id,full_name,phone,role,created_at")
            .order("created_at", desc=True)
        )
        active_listings = _fetch_all(
            db.table("listings")
            .select("id,price_per_unit")
            .eq("status", "active")
        )
        orders = _fetch_all(
            db.table("marketplace_orders")
            .select("id,total_price,status")
        )
        farms = _fetch_all(
            db.table("farms")
            .select("id,area_acres")
        )
        lots = _fetch_all(
            db.table("produce_lots")
            .select("id,available_quantity")
        )
        documents = _fetch_all(
            db.table("farmer_documents")
            .select("user_id,verification_status")
        )
    except Exception as exc:
        logger.exception("Admin dashboard summary query failed for profile %s", user.id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Platform metrics are temporarily unavailable. Please refresh.",
        ) from exc

    documents_by_user: dict[str, list[str]] = {}
    for document in documents:
        owner_id = str(document.get("user_id") or "")
        if owner_id:
            documents_by_user.setdefault(owner_id, []).append(
                str(document.get("verification_status") or "")
            )

    users = []
    farmer_accounts = 0
    verified_farmers = 0
    for profile in profiles:
        profile_id = str(profile.get("id") or "")
        role = str(profile.get("role") or "farmer").strip().lower()
        document_status = _document_status(documents_by_user.get(profile_id, []))
        if role == "farmer":
            farmer_accounts += 1
            if document_status == "verified":
                verified_farmers += 1
        users.append({
            "id": profile_id,
            "full_name": profile.get("full_name"),
            "phone": profile.get("phone"),
            "role": role,
            "document_status": document_status,
        })

    active_order_rows = [
        order for order in orders
        if str(order.get("status") or "").strip().lower() not in _CANCELLED_ORDER_STATUSES
    ]
    active_order_count = sum(
        1 for order in orders
        if str(order.get("status") or "").strip().lower() in _ACTIVE_ORDER_STATUSES
    )
    completed_order_count = sum(
        1 for order in orders
        if str(order.get("status") or "").strip().lower() in _COMPLETED_ORDER_STATUSES
    )
    order_volume = sum(
        (_as_decimal(order.get("total_price")) for order in active_order_rows),
        Decimal("0"),
    )
    total_farm_area = sum(
        (_as_decimal(farm.get("area_acres")) for farm in farms),
        Decimal("0"),
    )
    total_available_stock = sum(
        (_as_decimal(lot.get("available_quantity")) for lot in lots),
        Decimal("0"),
    )
    asking_prices = [
        _as_decimal(listing.get("price_per_unit"))
        for listing in active_listings
        if listing.get("price_per_unit") is not None
    ]
    average_asking_price = (
        sum(asking_prices, Decimal("0")) / len(asking_prices)
        if asking_prices else Decimal("0")
    )

    return {
        "summary": {
            "registered_users": len(profiles),
            "farmer_accounts": farmer_accounts,
            "verified_farmers": verified_farmers,
            "active_listings": len(active_listings),
            "total_orders": len(orders),
            "active_orders": active_order_count,
            "completed_orders": completed_order_count,
            "order_volume_inr": float(order_volume),
            "total_farms": len(farms),
            "total_farm_acres": round(float(total_farm_area), 2),
            "total_available_stock_kg": float(total_available_stock),
            "average_asking_price_per_unit": round(float(average_asking_price), 2),
        },
        "users": users,
    }
