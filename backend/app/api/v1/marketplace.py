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
    buyer = _buyer_profile(user)
    query = get_supabase().table("buyer_rfqs").select("*").eq("buyer_id", str(buyer["id"])).eq("status", status).order("created_at", desc=True)
    result = query.execute()
    return result.data or []


@router.post("/offers", status_code=201)
def create_offer(request: OfferCreate, user: AuthenticatedUser = Depends(get_current_user)):
    rfq = (
        get_supabase()
        .table("buyer_rfqs")
        .select("id,status,quantity,unit")
        .eq("id", str(request.rfq_id))
        .eq("status", "open")
        .limit(1)
        .execute()
    )
    _single(rfq, "RFQ not found or closed")
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
    listing = (
        get_supabase()
        .table("listings")
        .select("id,seller_id,lot_id,price_per_unit,min_order_quantity,status")
        .eq("id", str(request.listing_id))
        .eq("status", "active")
        .limit(1)
        .execute()
    )
    listing_row = _single(listing, "Listing not found or inactive")
    if listing_row["seller_id"] == str(user.id):
        raise HTTPException(status_code=400, detail="Cannot order your own listing")
    if request.quantity < Decimal(str(listing_row["min_order_quantity"])):
        raise HTTPException(status_code=400, detail="Quantity is below the listing minimum")

    lot = get_supabase().table("produce_lots").select("id,available_quantity,status").eq("id", str(listing_row["lot_id"])).limit(1).execute()
    lot_row = _single(lot, "Produce lot not found")
    available = Decimal(str(lot_row["available_quantity"]))
    if lot_row["status"] != "available" or request.quantity > available:
        raise HTTPException(status_code=400, detail="Insufficient available quantity")

    payload = {
        "listing_id": str(request.listing_id),
        "buyer_id": str(user.id),
        "seller_id": listing_row["seller_id"],
        "quantity": str(request.quantity),
        "unit": request.unit,
        "unit_price": str(listing_row["price_per_unit"]),
        "status": "pending",
    }
    try:
        result = get_supabase().table("marketplace_orders").insert(payload).execute()
        return _single(result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create order") from exc


@router.get("/orders")
def list_orders(user: AuthenticatedUser = Depends(get_current_user)):
    result = (
        get_supabase()
        .table("marketplace_orders")
        .select("*")
        .or_(f"buyer_id.eq.{user.id},seller_id.eq.{user.id}")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []
