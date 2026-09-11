import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from backend.app.core.database import Base


class AgriculturalFinanceModel(Base):
    __tablename__ = "agricultural_finances"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    credit_application_code = Column(String(100), nullable=False, unique=True, index=True)
    farmer_ref = Column(String(100), nullable=False, index=True)
    finance_product_type = Column(String(50), nullable=False) # WORKING_CAPITAL, CROP_FINANCE, WAREHOUSE_BACKED, TRADE_FINANCE, EQUIPMENT_FINANCE
    requested_amount_inr = Column(Numeric(12, 2), nullable=False)
    risk_score = Column(Numeric(5, 2), nullable=False)
    liquidity_assessment = Column(JSON, nullable=True)
    approval_status = Column(String(30), default="DECISION_SUPPORT_READY")
    created_at = Column(DateTime, default=datetime.utcnow)


class AlliedRegistryModel(Base):
    __tablename__ = "allied_registries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_code = Column(String(100), nullable=False, unique=True, index=True)
    farmer_ref = Column(String(100), nullable=False, index=True)
    allied_category = Column(String(50), nullable=False) # LIVESTOCK, DAIRY, POULTRY, FISHERIES, AQUACULTURE, BEEKEEPING, AGROFORESTRY
    head_count_or_scale = Column(Integer, nullable=False)
    health_status = Column(String(50), default="HEALTHY")
    monthly_yield_units = Column(Numeric(10, 2), default=0.0)
    yield_unit = Column(String(30), default="LITERS")
    created_at = Column(DateTime, default=datetime.utcnow)
