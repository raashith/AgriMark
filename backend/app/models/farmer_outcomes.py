import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class FarmerEconomicProfileModel(Base):
    __tablename__ = "farmer_economic_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_ref = Column(String(100), nullable=False, unique=True, index=True)
    farm_ref = Column(String(100), nullable=False)
    season = Column(String(50), nullable=False)
    gross_revenue_inr = Column(Numeric(12, 2), default=0.00)
    gross_cost_inr = Column(Numeric(12, 2), default=0.00)
    net_farm_income_inr = Column(Numeric(12, 2), default=0.00)
    profit_margin_pct = Column(Numeric(5, 2), default=0.00)
    cost_breakdown = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OutcomeInterventionModel(Base):
    __tablename__ = "outcome_interventions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    intervention_code = Column(String(100), nullable=False, unique=True)
    farmer_ref = Column(String(100), nullable=False, index=True)
    intervention_type = Column(String(50), nullable=False)
    recommendation = Column(Text, nullable=False)
    confidence_score = Column(Numeric(5, 4), default=0.95)
    action_taken = Column(String(20), default="YES")
    non_adoption_reason = Column(String(100), nullable=True)
    intervention_date = Column(DateTime, default=datetime.utcnow)


class OutcomeMeasurementModel(Base):
    __tablename__ = "outcome_measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    intervention_id = Column(String(36), ForeignKey("outcome_interventions.id"), nullable=False)
    farmer_ref = Column(String(100), nullable=False, index=True)
    metric_name = Column(String(50), nullable=False) # NET_INCOME, YIELD, COST_SAVINGS, WATER_SAVINGS, AVOIDED_LOSS
    value = Column(Numeric(12, 2), nullable=False)
    evidence_status = Column(String(30), default="OBSERVED") # OBSERVED, VERIFIED_OBSERVED, SELF_REPORTED, ESTIMATED, ATTRIBUTED, PROJECTED, SIMULATED
    confidence = Column(Numeric(5, 4), default=0.90)
    provenance = Column(JSON, nullable=True)
    measured_at = Column(DateTime, default=datetime.utcnow)
