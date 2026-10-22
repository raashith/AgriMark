from datetime import datetime, timezone
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
    unit: str = Field(default="kg", min_length=1, max_length=20)
    target_price: Decimal | None = Field(default=None, ge=0)
    delivery_district: str | None = Field(default=None, max_length=120)
    delivery_state: str | None = Field(default=None, max_length=120)
    deadline: str | None = None


class OfferCreate(BaseModel):
    rfq_id: UUID
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    seller_note: str | None = Field(default=None, max_length=1000)


class OrderCreate(BaseModel):
    listing_id: UUID
    quantity: Decimal = Field(gt=0)
    unit: str = Field(default="kg", min_length=1, max_length=20)


class BuyerProfileUpdate(BaseModel):
    organization_name: str | None = Field(default=None, max_length=200)
    buyer_type: str = Field(default="individual", pattern="^(individual|retailer|processor|wholesaler|fpo|institution|other)$")
    procurement_regions: list[str] = Field(default_factory=list, max_length=50)


def _db():
    return get_supabase()


def _single(result, not_found: str = "Resource not found"):
    data = result.data
    if not data:
        raise HTTPException(status_code=404, detail=not_found)
    return data[0] if isinstance(data, list) else data


def _role(user: AuthenticatedUser) -> str:
    return str(getattr(user, "role", "authenticated") or "authenticated").lower()


def _require_role(user: AuthenticatedUser, *roles: str) -> None:
    if _role(user) not in roles:
        raise HTTPException(status_code=403, detail="Your account is not permitted to perform this marketplace action.")


def _buyer_profile(user: AuthenticatedUser, create: bool = False):
    db = _db()
    result = (
        db.table("buyer_profiles")
        .select("id,user_id,organization_name,buyer_type,procurement_regions")
        .eq("user_id", str(user.id))
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]
    if not create:
        raise HTTPException(status_code=404, detail="Buyer profile not found. Complete buyer onboarding first.")
    if _role(user) not in {"buyer", "admin"}:
        raise HTTPException(status_code=403, detail="Only buyer accounts can create a buyer profile.")
    try:
        inserted = db.table("buyer_profiles").upsert(
            {"user_id": str(user.id)}, on_conflict="user_id"
        ).execute()
        return _single(inserted, "Unable to create buyer profile")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to initialize buyer profile.") from exc


@router.get("/buyer-profile")
def get_buyer_profile(user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin")
    return _buyer_profile(user, create=True)


@router.patch("/buyer-profile")
def update_buyer_profile(request: BuyerProfileUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin")
    buyer = _buyer_profile(user, create=True)
    payload = request.model_dump()
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    try:
        result = _db().table("buyer_profiles").update(payload).eq("id", buyer["id"]).eq("user_id", str(user.id)).execute()
        return _single(result, "Buyer profile not found")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to update buyer profile.") from exc


@router.post("/rfqs", status_code=201)
def create_rfq(request: RFQCreate, user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin")
    buyer = _buyer_profile(user, create=True)
    payload = request.model_dump(exclude_none=True, mode="json")
    payload["buyer_id"] = buyer["id"]
    try:
        result = _db().table("buyer_rfqs").insert(payload).execute()
        return _single(result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create RFQ. Check the crop, quantity and deadline.") from exc


@router.get("/rfqs")
def list_rfqs(status: str = Query(default="open", max_length=30), user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin", "farmer", "fpo")
    db = _db()
    query = db.table("buyer_rfqs").select("*").eq("status", status).order("created_at", desc=True)
    if _role(user) in {"buyer", "admin"}:
        buyer = _buyer_profile(user, create=True)
        query = query.eq("buyer_id", buyer["id"])
    return query.execute().data or []


@router.post("/offers", status_code=201)
def create_offer(request: OfferCreate, user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "farmer", "fpo", "admin")
    db = _db()
    rfq_result = (
        db.table("buyer_rfqs")
        .select("id,status,quantity,unit,buyer_id")
        .eq("id", str(request.rfq_id))
        .eq("status", "open")
        .limit(1)
        .execute()
    )
    rfq = _single(rfq_result, "RFQ not found or closed")
    buyer_result = db.table("buyer_profiles").select("id,user_id").eq("id", rfq["buyer_id"]).limit(1).execute()
    buyer = _single(buyer_result, "RFQ buyer not found")
    if buyer["user_id"] == str(user.id):
        raise HTTPException(status_code=400, detail="Buyer cannot make an offer to their own RFQ")
    payload = request.model_dump(mode="json")
    payload["seller_id"] = str(user.id)
    try:
        result = db.table("marketplace_offers").insert(payload).execute()
        return _single(result)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create supplier offer.") from exc


@router.get("/offers")
def list_offers(user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin", "farmer", "fpo")
    db = _db()
    if _role(user) in {"farmer", "fpo"}:
        return (
            db.table("marketplace_offers").select("*")
            .eq("seller_id", str(user.id)).order("created_at", desc=True).execute().data or []
        )
    buyer = _buyer_profile(user, create=True)
    rfqs = db.table("buyer_rfqs").select("id").eq("buyer_id", buyer["id"]).execute().data or []
    rfq_ids = [row["id"] for row in rfqs]
    if not rfq_ids:
        return []
    # Query per RFQ to avoid relying on client-side RLS for service-role requests.
    offers = []
    for rfq_id in rfq_ids:
        rows = db.table("marketplace_offers").select("*").eq("rfq_id", rfq_id).order("created_at", desc=True).execute().data or []
        offers.extend(rows)
    return sorted(offers, key=lambda row: row.get("created_at", ""), reverse=True)


@router.post("/orders", status_code=201)
def create_order(request: OrderCreate, user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin")
    # Ensure the order is linked to the authenticated buyer profile; the client cannot choose buyer_id.
    _buyer_profile(user, create=True)
    try:
        result = _db().rpc(
            "create_marketplace_order_atomic",
            {
                "p_listing_id": str(request.listing_id),
                "p_buyer_id": str(user.id),
                "p_quantity": str(request.quantity),
            },
        ).execute()
        return _single(result, "Order could not be created")
    except HTTPException:
        raise
    except Exception as exc:
        # Translate known business failures; keep database internals out of the response.
        detail = str(exc).lower()
        if "seller cannot buy" in detail:
            raise HTTPException(status_code=400, detail="You cannot order your own listing.") from exc
        if "below the listing minimum" in detail or "minimum" in detail:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if "insufficient stock" in detail:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        if "listing is not active" in detail or "listing not found" in detail or "produce lot is not available" in detail:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        raise HTTPException(status_code=500, detail="Order could not be completed safely. No order should be assumed placed; refresh your orders before retrying.") from exc


@router.get("/orders")
def list_orders(user: AuthenticatedUser = Depends(get_current_user)):
    _require_role(user, "buyer", "admin", "farmer", "fpo")
    try:
        return (
            _db().table("marketplace_orders").select("*")
            .or_(f"buyer_id.eq.{user.id},seller_id.eq.{user.id}")
            .order("created_at", desc=True).execute().data or []
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to load marketplace orders.") from exc


@router.get("/listings")
def list_marketplace_listings(status: str = Query(default="active", max_length=30)):
    from .core import list_listings
    return list_listings(status=status)
