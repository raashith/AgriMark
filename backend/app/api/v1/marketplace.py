from datetime import datetime, timezone
from decimal import Decimal
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.database import get_supabase

router = APIRouter(prefix="/marketplace", tags=["marketplace"])
logger = logging.getLogger(__name__)


class RFQCreate(BaseModel):
    crop_id: UUID | None = None
    quantity: Decimal = Field(gt=0)
    unit: str = "kg"
    target_price: Decimal | None = Field(default=None, ge=0)
    delivery_district: str | None = None
    delivery_state: str | None = None
    deadline: str | None = None


class OfferCreate(BaseModel):
    rfq_id: UUID
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class OrderCreate(BaseModel):
    listing_id: UUID
    quantity: Decimal = Field(gt=0)
    unit: str = "kg"


class OrderAddressUpdate(BaseModel):
    delivery_address: str = Field(min_length=5, max_length=1000)


class OrderCancelRequest(BaseModel):
    reason: str | None = Field(default=None, max_length=300)


def _single(result, not_found: str = "Resource not found"):
    data = result.data
    if not data:
        raise HTTPException(status_code=404, detail=not_found)
    return data[0] if isinstance(data, list) else data


def _buyer_profile(user: AuthenticatedUser):
    result = (
        get_supabase()
        .table("buyer_profiles")
        .select("id,user_id,organization_name,buyer_type,procurement_regions")
        .eq("user_id", str(user.id))
        .limit(1)
        .execute()
    )
    return _single(result, "Buyer profile not found")


@router.post("/rfqs", status_code=201)
def create_rfq(request: RFQCreate, user: AuthenticatedUser = Depends(get_current_user)):
    buyer = _buyer_profile(user)
    payload = request.model_dump(exclude_none=True, mode="json")
    payload["buyer_id"] = buyer["id"]
    try:
        result = get_supabase().table("buyer_rfqs").insert(payload).execute()
        return _single(result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create RFQ") from exc


@router.get("/rfqs")
def list_rfqs(status: str = Query(default="open", max_length=30), user: AuthenticatedUser = Depends(get_current_user)):
    # Buyers see their own RFQs. Sellers see all open RFQs so they can respond.
    table = get_supabase().table("buyer_rfqs").select("*").eq("status", status).order("created_at", desc=True)
    if user.role == "authenticated":
        # The route cannot infer the application role from the Auth role claim.
        # Return marketplace-wide open RFQs, while database RLS remains the final boundary.
        pass
    result = table.execute()
    return result.data or []


@router.post("/offers", status_code=201)
def create_offer(request: OfferCreate, user: AuthenticatedUser = Depends(get_current_user)):
    rfq = (
        get_supabase()
        .table("buyer_rfqs")
        .select("id,status,quantity,unit,buyer_id")
        .eq("id", str(request.rfq_id))
        .eq("status", "open")
        .limit(1)
        .execute()
    )
    rfq_row = _single(rfq, "RFQ not found or closed")

    buyer = get_supabase().table("buyer_profiles").select("id,user_id").eq("id", rfq_row["buyer_id"]).limit(1).execute()
    buyer_row = _single(buyer, "RFQ buyer not found")
    if buyer_row["user_id"] == str(user.id):
        raise HTTPException(status_code=400, detail="Buyer cannot make an offer to their own RFQ")

    payload = request.model_dump(mode="json")
    payload["seller_id"] = str(user.id)
    try:
        result = get_supabase().table("marketplace_offers").insert(payload).execute()
        return _single(result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create offer") from exc


@router.get("/offers")
def list_offers(user: AuthenticatedUser = Depends(get_current_user)):
    result = get_supabase().table("marketplace_offers").select("*").eq("seller_id", str(user.id)).order("created_at", desc=True).execute()
    return result.data or []


@router.post("/orders", status_code=201)
def create_order(request: OrderCreate, user: AuthenticatedUser = Depends(get_current_user)):
    db = get_supabase()
    try:
        result = db.rpc(
            "create_marketplace_order_atomic",
            {
                "p_listing_id": str(request.listing_id),
                "p_buyer_id": str(user.id),
                "p_quantity": str(request.quantity),
            },
        ).execute()
        order = dict(_single(result))

        # The order itself is committed transactionally by the RPC. Notification
        # delivery is best-effort so a notification issue never reports a failed
        # purchase after inventory has already been reserved.
        try:
            listing_result = (
                db.table("listings")
                .select("id,title")
                .eq("id", str(order.get("listing_id") or request.listing_id))
                .limit(1)
                .execute()
            )
            listing = (listing_result.data or [{}])[0]
            title = str(listing.get("title") or "your listed produce")
            quantity_kg = order.get("quantity_kg", request.quantity)
            total_price = order.get("total_price")
            amount_text = f" for ₹{float(total_price):,.0f}" if total_price is not None else ""
            db.table("user_notifications").insert({
                "user_id": str(order["seller_id"]),
                "order_id": str(order["id"]),
                "type": "marketplace_order",
                "title": "New buyer order received",
                "message": f"A buyer ordered {float(quantity_kg):g} kg of {title}{amount_text}. Review the order and buyer details.",
                "channel": "in_app",
                "delivery_status": "delivered",
                "is_read": False,
            }).execute()
        except Exception:
            logger.exception("Order %s was created, but seller notification could not be saved", order.get("id"))

        return order
    except Exception as exc:
        detail = str(exc)
        if "seller cannot buy" in detail or "quantity is below" in detail or "insufficient" in detail or "listing is not active" in detail:
            raise HTTPException(status_code=400, detail=detail) from exc
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status_code=400, detail="Unable to create order safely") from exc


@router.get("/orders")
def list_orders(user: AuthenticatedUser = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("marketplace_orders")
        .select("*")
        .or_(f"buyer_id.eq.{user.id},seller_id.eq.{user.id}")
        .order("created_at", desc=True)
        .execute()
    )
    orders = [dict(row) for row in (result.data or [])]
    if not orders:
        return []

    listing_ids = list({str(row["listing_id"]) for row in orders if row.get("listing_id")})
    listings = {}
    if listing_ids:
        listing_result = (
            db.table("listings")
            .select("id,title,price_per_unit,lot_id,produce_lots(crop_id,quality_grade,crops(name))")
            .in_("id", listing_ids)
            .execute()
        )
        listings = {str(row["id"]): row for row in (listing_result.data or [])}

    # Enrich only the orders visible to this authenticated participant. A farmer
    # sees the buyer's contact details for their own orders; buyers do not gain
    # access to other buyers or sellers because the base order query is scoped.
    buyer_ids = list({str(row["buyer_id"]) for row in orders if row.get("buyer_id")})
    buyers = {}
    buyer_profiles = {}
    if buyer_ids:
        buyer_result = (
            db.table("profiles")
            .select("id,full_name,phone")
            .in_("id", buyer_ids)
            .execute()
        )
        buyers = {str(row["id"]): row for row in (buyer_result.data or [])}

        buyer_profile_result = (
            db.table("buyer_profiles")
            .select("user_id,organization_name,buyer_type")
            .in_("user_id", buyer_ids)
            .execute()
        )
        buyer_profiles = {str(row["user_id"]): row for row in (buyer_profile_result.data or [])}

    seller_ids = list({str(row["seller_id"]) for row in orders if row.get("seller_id")})
    sellers = {}
    if seller_ids:
        seller_result = db.table("profiles").select("id,full_name,phone").in_("id", seller_ids).execute()
        sellers = {str(row["id"]): row for row in (seller_result.data or [])}

    for order in orders:
        listing = listings.get(str(order.get("listing_id")), {})
        lot = listing.get("produce_lots") or {}
        if isinstance(lot, list):
            lot = lot[0] if lot else {}
        crop = lot.get("crops") or {}
        if isinstance(crop, list):
            crop = crop[0] if crop else {}
        order["crop_name"] = crop.get("name")
        order["listing_title"] = listing.get("title")
        order["unit_price"] = listing.get("price_per_unit")
        order["quality_grade"] = lot.get("quality_grade")

        seller = sellers.get(str(order.get("seller_id")), {})
        order["seller_name"] = seller.get("full_name")

        buyer = buyers.get(str(order.get("buyer_id")), {})
        buyer_profile = buyer_profiles.get(str(order.get("buyer_id")), {})
        order["buyer_name"] = buyer.get("full_name")
        order["buyer_phone"] = buyer.get("phone")
        order["buyer_organization"] = buyer_profile.get("organization_name")
        order["buyer_type"] = buyer_profile.get("buyer_type")

    return orders


@router.get("/notifications")
def list_notifications(user: AuthenticatedUser = Depends(get_current_user)):
    """List the current user's recent in-app notifications."""
    try:
        result = (
            get_supabase()
            .table("user_notifications")
            .select("id,user_id,order_id,type,title,message,is_read,created_at")
            .eq("user_id", str(user.id))
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        return result.data or []
    except Exception as exc:
        logger.exception("Unable to load notifications for profile %s", user.id)
        raise HTTPException(status_code=503, detail="Unable to load notifications right now.") from exc


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    user: AuthenticatedUser = Depends(get_current_user),
):
    """Mark a notification read only when it belongs to the authenticated user."""
    try:
        result = (
            get_supabase()
            .table("user_notifications")
            .update({"is_read": True})
            .eq("id", str(notification_id))
            .eq("user_id", str(user.id))
            .select("id,is_read")
            .limit(1)
            .execute()
        )
    except Exception as exc:
        logger.exception("Unable to mark notification read for profile %s", user.id)
        raise HTTPException(status_code=503, detail="Unable to update notification right now.") from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return result.data[0]


@router.patch("/orders/{order_id}/address")
def update_order_address(
    order_id: UUID,
    request: OrderAddressUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
):
    db = get_supabase()
    current = (
        db.table("marketplace_orders")
        .select("id,status")
        .eq("id", str(order_id))
        .eq("buyer_id", str(user.id))
        .limit(1)
        .execute()
    )
    if not current.data:
        raise HTTPException(status_code=404, detail="Order not found for this buyer.")

    status = str(current.data[0].get("status") or "").lower()
    if status in {"dispatched", "in_transit", "delivered", "cancelled", "rejected"}:
        raise HTTPException(status_code=409, detail="The delivery address can no longer be changed for this order.")
    normalized_address = request.delivery_address.strip()
    if len(normalized_address) < 5:
        raise HTTPException(status_code=422, detail="Enter a complete delivery address.")

    try:
        # jsonb is the canonical column type; store a named payload so the UI
        # can render both this format and older address records consistently.
        result = (
            db.table("marketplace_orders")
            .update({
                "delivery_address": {"formatted_address": normalized_address},
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
            .eq("id", str(order_id))
            .eq("buyer_id", str(user.id))
            .select("*")
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Unable to save the delivery address right now.") from exc
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found for this buyer.")
    return result.data[0]


@router.post("/orders/{order_id}/cancel")
def cancel_order(
    order_id: UUID,
    request: OrderCancelRequest,
    user: AuthenticatedUser = Depends(get_current_user),
):
    try:
        result = get_supabase().rpc(
            "cancel_marketplace_order_atomic",
            {
                "p_order_id": str(order_id),
                "p_buyer_id": str(user.id),
                "p_reason": (request.reason or "Cancelled by buyer").strip()[:300],
            },
        ).execute()
        return _single(result, "Order not found")
    except HTTPException:
        raise
    except Exception as exc:
        detail = str(exc).lower()
        if "order not found" in detail:
            raise HTTPException(status_code=404, detail="Order not found for this buyer.") from exc
        if "buyer" in detail or "only unaccepted" in detail or "cannot be cancelled" in detail:
            raise HTTPException(status_code=409, detail="This order can no longer be cancelled. Contact the seller for help.") from exc
        raise HTTPException(status_code=503, detail="Unable to cancel this order right now. Please retry.") from exc


@router.get("/listings")
def list_marketplace_listings(status: str = Query(default="active", max_length=30)):
    from .core import list_listings
    return list_listings(status=status)

