import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from backend.app.core.database import Base


class GlobalTradeCorridorModel(Base):
    __tablename__ = "global_trade_corridors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    corridor_code = Column(String(100), nullable=False, unique=True, index=True)
    origin_country = Column(String(100), default="India")
    destination_country = Column(String(100), nullable=False)
    commodity = Column(String(100), nullable=False)
    import_duty_pct = Column(Numeric(5, 2), default=0.0)
    quality_standard = Column(String(100), nullable=True)
    landed_cost_usd_per_mt = Column(Numeric(10, 2), nullable=False)
    competitiveness_score = Column(Numeric(5, 2), default=88.5)
    created_at = Column(DateTime, default=datetime.utcnow)


class CircularMarketplaceModel(Base):
    __tablename__ = "circular_marketplaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flow_code = Column(String(100), nullable=False, unique=True, index=True)
    waste_source_type = Column(String(50), nullable=False) # CROP_RESIDUE, ANIMAL_WASTE, FOOD_WASTE, PROCESSING_WASTE
    quantity_mt = Column(Numeric(10, 2), nullable=False)
    destination_product = Column(String(50), nullable=False) # COMPOST, BIOFERTILIZER, BIOGAS, CBG, ANIMAL_FEED, BIOMATERIALS
    processor_name = Column(String(150), nullable=False)
    circular_value_inr = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DisasterEventModel(Base):
    __tablename__ = "disaster_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_code = Column(String(100), nullable=False, unique=True, index=True)
    hazard_type = Column(String(50), nullable=False) # HEAT, DROUGHT, FLOOD, CYCLONE, EXTREME_RAINFALL, PEST_AMPLIFICATION
    affected_district = Column(String(100), nullable=False)
    severity_level = Column(String(20), default="HIGH")
    lifecycle_stage = Column(String(30), default="DETECTED") # DETECTED, CONFIRMED, ALERT, RESPONSE, RECOVERY, CLOSED
    estimated_crop_loss_ha = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
