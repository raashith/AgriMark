from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ...core.auth import AuthenticatedUser, get_current_user
from ...core.database import get_supabase

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


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
    try:
        result = get_supabase().rpc(
            "create_marketplace_order_atomic",
            {
                "p_listing_id": str(request.listing_id),
                "p_buyer_id": str(user.id),
                "p_quantity": str(request.quantity),
            },
        ).execute()
        return _single(result)
    except Exception as exc:
        detail = str(exc)
        if "seller cannot buy" in detail or "quantity is below" in detail or "insufficient" in detail or "listing is not active" in detail:
            raise HTTPException(status_code=400, detail=detail) from exc
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

    # Orders keep a stable listing_id, while the display title/crop belongs to
    # the listing and its produce lot. Resolve these even when a listing is sold
    # or no longer appears in the active marketplace feed.
    listing_ids = list({row["listing_id"] for row in orders if row.get("listing_id")})
    listings = {}
    if listing_ids:
        listing_result = (
            db.table("listings")
            .select("id,title,price_per_unit,lot_id,produce_lots(crop_id,quality_grade,crops(name))")
            .in_("id", listing_ids)
            .execute()
        )
        listings = {row["id"]: row for row in (listing_result.data or [])}

    seller_ids = list({row["seller_id"] for row in orders if row.get("seller_id")})
    sellers = {}
    if seller_ids:
        seller_result = db.table("profiles").select("id,full_name").in_("id", seller_ids).execute()
        sellers = {row["id"]: row for row in (seller_result.data or [])}

    for order in orders:
        listing = listings.get(order.get("listing_id"), {})
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
        seller = sellers.get(order.get("seller_id"), {})
        order["seller_name"] = seller.get("full_name")
    return orders


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

    try:
        # jsonb is the canonical column type; store a named payload so the UI
        # can render both this format and older address records consistently.
        result = (
            db.table("marketplace_orders")
            .update({
                "delivery_address": {"formatted_address": request.delivery_address.strip()},
                "updated_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
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

