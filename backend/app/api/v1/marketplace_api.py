import uuid
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, ConfigDict, Field
from backend.app.core.database import get_db
from backend.app.security.dependencies import get_current_user
from backend.app.models.user import User, FarmerProfile, BuyerProfile
from backend.app.services.inventory_reservation_service import InventoryReservationService

router = APIRouter(prefix="/marketplace", tags=["Marketplace & Direct Commerce"])


# ==========================================
# PYDANTIC SCHEMAS FOR MARKETPLACE
# ==========================================

class ListingCreate(BaseModel):
    lot_id: str
    title: str = Field(..., max_length=150)
    description: Optional[str] = None
    price_per_kg: Decimal = Field(..., gt=0)
    available_quantity_kg: Decimal = Field(..., gt=0)

class ListingResponse(BaseModel):
    id: str
    lot_id: str
    seller_id: str
    title: str
    description: Optional[str]
    price_per_kg: Decimal
    available_quantity_kg: Decimal
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BuyerRFQCreate(BaseModel):
    commodity_name: str
    required_quantity_kg: Decimal = Field(..., gt=0)
    target_price_per_kg: Optional[Decimal] = None
    delivery_location: str
    required_date: date

class BuyerRFQResponse(BaseModel):
    id: str
    buyer_id: str
    commodity_name: str
    required_quantity_kg: Decimal
    target_price_per_kg: Optional[Decimal]
    delivery_location: str
    required_date: date
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OfferCreate(BaseModel):
    listing_id: str
    offered_price_per_kg: Decimal = Field(..., gt=0)
    offered_quantity_kg: Decimal = Field(..., gt=0)
    notes: Optional[str] = None

class OfferResponse(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    offered_price_per_kg: Decimal
    offered_quantity_kg: Decimal
    notes: Optional[str]
    status: str
    created_at: datetime


class OrderCreate(BaseModel):
    listing_id: str
    quantity_kg: Decimal = Field(..., gt=0)

class OrderResponse(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    quantity_kg: Decimal
    total_amount: Decimal
    order_status: str
    created_at: datetime


# ==========================================
# MARKETPLACE ROUTE IMPLEMENTATIONS
# ==========================================

@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not profile:
        profile_id = f"farmer-{current_user.id[:8]}"
        profile = FarmerProfile(id=profile_id, user_id=current_user.id, verification_status="verified")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    seller_id = profile.id
    listing_id = str(uuid.uuid4())
    db.execute(
        text("""INSERT INTO marketplace_listings (id, lot_id, seller_id, title, description, price_per_kg, available_quantity_kg, status)
           VALUES (:id, :lot_id, :seller_id, :title, :description, :price_per_kg, :available_quantity_kg, 'PUBLISHED')"""),
        {
            "id": listing_id,
            "lot_id": data.lot_id,
            "seller_id": seller_id,
            "title": data.title,
            "description": data.description,
            "price_per_kg": float(data.price_per_kg),
            "available_quantity_kg": float(data.available_quantity_kg)
        }
    )
    db.commit()
    row = db.execute(text("SELECT * FROM marketplace_listings WHERE id = :id"), {"id": listing_id}).fetchone()
    return ListingResponse(
        id=row.id,
        lot_id=row.lot_id,
        seller_id=row.seller_id,
        title=row.title,
        description=row.description,
        price_per_kg=Decimal(str(row.price_per_kg)),
        available_quantity_kg=Decimal(str(row.available_quantity_kg)),
        status=row.status,
        created_at=row.created_at or datetime.utcnow()
    )


@router.get("/search", response_model=List[ListingResponse])
def search_listings(
    commodity: Optional[str] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    min_quantity: Optional[Decimal] = Query(None),
    db: Session = Depends(get_db)
):
    query_str = "SELECT * FROM marketplace_listings WHERE status = 'PUBLISHED'"
    params = {}

    if commodity:
        query_str += " AND title LIKE :commodity"
        params["commodity"] = f"%{commodity}%"
    if max_price:
        query_str += " AND price_per_kg <= :max_price"
        params["max_price"] = float(max_price)
    if min_quantity:
        query_str += " AND available_quantity_kg >= :min_quantity"
        params["min_quantity"] = float(min_quantity)

    query_str += " ORDER BY created_at DESC LIMIT 50"
    rows = db.execute(text(query_str), params).fetchall()

    return [
        ListingResponse(
            id=r.id,
            lot_id=r.lot_id,
            seller_id=r.seller_id,
            title=r.title,
            description=r.description,
            price_per_kg=Decimal(str(r.price_per_kg)),
            available_quantity_kg=Decimal(str(r.available_quantity_kg)),
            status=r.status,
            created_at=r.created_at or datetime.utcnow()
        ) for r in rows
    ]


@router.post("/rfqs", response_model=BuyerRFQResponse, status_code=status.HTTP_201_CREATED)
def send_buyer_rfq(
    data: BuyerRFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not profile:
        buyer_id = f"buyer-{current_user.id[:8]}"
        profile = BuyerProfile(id=buyer_id, user_id=current_user.id, verification_status="verified")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    buyer_id = profile.id
    rfq_id = str(uuid.uuid4())
    db.execute(
        text("""INSERT INTO buyer_rfqs (id, buyer_id, commodity_name, required_quantity_kg, target_price_per_kg, delivery_location, required_date, status)
           VALUES (:id, :buyer_id, :commodity_name, :req_qty, :target_price, :delivery_loc, :req_date, 'OPEN')"""),
        {
            "id": rfq_id,
            "buyer_id": buyer_id,
            "commodity_name": data.commodity_name,
            "req_qty": float(data.required_quantity_kg),
            "target_price": float(data.target_price_per_kg) if data.target_price_per_kg else None,
            "delivery_loc": data.delivery_location,
            "req_date": data.required_date
        }
    )
    db.commit()
    row = db.execute(text("SELECT * FROM buyer_rfqs WHERE id = :id"), {"id": rfq_id}).fetchone()

    return BuyerRFQResponse(
        id=row.id,
        buyer_id=row.buyer_id,
        commodity_name=row.commodity_name,
        required_quantity_kg=Decimal(str(row.required_quantity_kg)),
        target_price_per_kg=Decimal(str(row.target_price_per_kg)) if row.target_price_per_kg else None,
        delivery_location=row.delivery_location,
        required_date=row.required_date,
        status=row.status,
        created_at=row.created_at or datetime.utcnow()
    )


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_marketplace_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not profile:
        buyer_id = f"buyer-{current_user.id[:8]}"
        profile = BuyerProfile(id=buyer_id, user_id=current_user.id, verification_status="verified")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    buyer_id = profile.id
    listing = db.execute(text("SELECT * FROM marketplace_listings WHERE id = :lid"), {"lid": data.listing_id}).fetchone()
    if not listing:
        raise HTTPException(status_code=404, detail="Marketplace listing not found")

    if listing.available_quantity_kg < float(data.quantity_kg):
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available listing stock")

    res = InventoryReservationService().reserve_inventory(db, listing.lot_id, float(data.quantity_kg))
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("reason", "Inventory reservation failed"))

    total_amount = float(data.quantity_kg) * float(listing.price_per_kg)
    order_id = str(uuid.uuid4())

    db.execute(
        text("""INSERT INTO marketplace_orders (id, listing_id, buyer_id, quantity_kg, total_amount, order_status)
           VALUES (:id, :listing_id, :buyer_id, :quantity_kg, :total_amount, 'CONFIRMED')"""),
        {
            "id": order_id,
            "listing_id": data.listing_id,
            "buyer_id": buyer_id,
            "quantity_kg": float(data.quantity_kg),
            "total_amount": total_amount
        }
    )

    new_qty = listing.available_quantity_kg - float(data.quantity_kg)
    new_status = "SOLD_OUT" if new_qty <= 0 else "PUBLISHED"
    db.execute(
        text("UPDATE marketplace_listings SET available_quantity_kg = :new_qty, status = :status WHERE id = :id"),
        {"new_qty": new_qty, "status": new_status, "id": data.listing_id}
    )
    db.commit()

    return OrderResponse(
        id=order_id,
        listing_id=data.listing_id,
        buyer_id=buyer_id,
        quantity_kg=data.quantity_kg,
        total_amount=Decimal(str(total_amount)),
        order_status="CONFIRMED",
        created_at=datetime.utcnow()
    )


@router.post("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    new_status: str = Query(..., pattern="^(IN_TRANSIT|DELIVERED|COMPLETED|CANCELLED)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.execute(text("SELECT * FROM marketplace_orders WHERE id = :oid"), {"oid": order_id}).fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.execute(
        text("UPDATE marketplace_orders SET order_status = :status WHERE id = :id"),
        {"status": new_status, "id": order_id}
    )
    db.commit()

    return OrderResponse(
        id=order.id,
        listing_id=order.listing_id,
        buyer_id=order.buyer_id,
        quantity_kg=Decimal(str(order.quantity_kg)),
        total_amount=Decimal(str(order.total_amount)),
        order_status=new_status,
        created_at=order.created_at or datetime.utcnow()
    )


@router.get("/traceability/{reference_id}")
def get_produce_traceability(
    reference_id: str,
    db: Session = Depends(get_db)
):
    from backend.app.services.farmer_data_service import FarmerDataService
    return FarmerDataService.get_produce_traceability(db, reference_id)

