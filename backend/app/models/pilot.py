import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Numeric, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class PilotCohort(Base):
    __tablename__ = "pilot_cohorts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pilot_code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False)
    target_farmers = Column(Integer, default=50)
    status = Column(String(30), default="ACTIVE") # DRAFT, ACTIVE, COMPLETED, SUSPENDED
    start_date = Column(Date, default=date.today)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    participants = relationship("PilotParticipant", back_populates="cohort", cascade="all, delete-orphan")


class PilotParticipant(Base):
    __tablename__ = "pilot_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cohort_id = Column(String(36), ForeignKey("pilot_cohorts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    participant_role = Column(String(50), default="FARMER") # FARMER, BUYER, LOGISTICS, AGENT
    onboarding_date = Column(Date, default=date.today)
    consent_version = Column(String(20), default="v1.0")
    consent_granted = Column(Boolean, default=True)
    voice_preference = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cohort = relationship("PilotCohort", back_populates="participants")


class AIFeedbackLoop(Base):
    __tablename__ = "ai_feedback_loops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_id = Column(String(36), nullable=True)
    farmer_question = Column(Text, nullable=False)
    context_snapshot = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=False)
    model_version = Column(String(50), default="AgriMark-Gemini-Pilot-v1")
    tool_calls_json = Column(Text, nullable=True)
    farmer_feedback_rating = Column(Integer, nullable=True) # 1 to 5 stars
    action_taken = Column(String(50), default="UNDER_REVIEW") # IGNORED, ACCEPTED, ACTED_UPON, VERIFIED
    outcome_observed = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MarketFeedbackLoop(Base):
    __tablename__ = "market_feedback_loops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    crop_name = Column(String(100), nullable=False, index=True)
    market_name = Column(String(150), nullable=False)
    observed_price = Column(Numeric(10, 2), nullable=False)
    recommended_market = Column(String(150), nullable=True)
    listing_price = Column(Numeric(10, 2), nullable=True)
    buyer_offer_price = Column(Numeric(10, 2), nullable=True)
    final_transaction_price = Column(Numeric(10, 2), nullable=False)
    quantity_sold_kg = Column(Numeric(12, 2), nullable=False)
    time_to_sale_hours = Column(Numeric(8, 2), default=24.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgriOutcomeTrack(Base):
    __tablename__ = "agri_outcome_tracks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    crop_id = Column(String(36), ForeignKey("crops.id", ondelete="CASCADE"), nullable=False)
    harvest_batch_id = Column(String(36), nullable=True)
    yield_kg = Column(Numeric(12, 2), nullable=False)
    quality_grade = Column(String(20), default="STANDARD")
    input_cost = Column(Numeric(12, 2), default=0.0)
    labor_cost = Column(Numeric(12, 2), default=0.0)
    irrigation_cost = Column(Numeric(12, 2), default=0.0)
    selling_price_per_kg = Column(Numeric(10, 2), nullable=False)
    gross_revenue = Column(Numeric(12, 2), nullable=False)
    net_profit = Column(Numeric(12, 2), nullable=False)
    crop_loss_kg = Column(Numeric(10, 2), default=0.0)
    rejection_reason = Column(String(255), nullable=True)
    farmer_satisfaction_rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
