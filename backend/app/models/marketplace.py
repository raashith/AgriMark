import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Numeric, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class ProduceLot(Base):
    __tablename__ = "produce_lots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id"), nullable=False, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id"), nullable=False)
    commodity_name = Column(String(100), nullable=False)
    quantity_kg = Column(Numeric(12, 2), nullable=False)
    reserved_quantity_kg = Column(Numeric(12, 2), default=0.00)
    harvest_date = Column(Date, nullable=False)
    quality_grade = Column(String(20), default="STANDARD")
    status = Column(String(30), default="AVAILABLE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listings = relationship("MarketplaceListing", back_populates="lot", cascade="all, delete-orphan")


class MarketplaceListing(Base):
    __tablename__ = "marketplace_listings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lot_id = Column(String(36), ForeignKey("produce_lots.id"), nullable=False)
    seller_id = Column(String(36), ForeignKey("farmer_profiles.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    available_quantity_kg = Column(Numeric(12, 2), nullable=False)
    status = Column(String(30), default="PUBLISHED", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lot = relationship("ProduceLot", back_populates="listings")
    orders = relationship("MarketplaceOrder", back_populates="listing", cascade="all, delete-orphan")


class BuyerRFQ(Base):
    __tablename__ = "buyer_rfqs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    buyer_id = Column(String(36), ForeignKey("buyer_profiles.id"), nullable=False, index=True)
    commodity_name = Column(String(100), nullable=False)
    required_quantity_kg = Column(Numeric(12, 2), nullable=False)
    target_price_per_kg = Column(Numeric(10, 2), nullable=True)
    delivery_location = Column(String(255), nullable=False)
    required_date = Column(Date, nullable=False)
    status = Column(String(30), default="OPEN", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MarketplaceOrder(Base):
    __tablename__ = "marketplace_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    listing_id = Column(String(36), ForeignKey("marketplace_listings.id"), nullable=False, index=True)
    buyer_id = Column(String(36), ForeignKey("buyer_profiles.id"), nullable=False, index=True)
    quantity_kg = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    order_status = Column(String(30), default="CREATED")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listing = relationship("MarketplaceListing", back_populates="orders")
