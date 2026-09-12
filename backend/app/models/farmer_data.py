import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Date, Numeric, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class FarmerDocument(Base):
    __tablename__ = "farmer_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False) # LAND_RECORD, ID_PROOF, BANK_PASSBOOK, CERTIFICATE
    title = Column(String(150), nullable=False)
    file_url = Column(String(500), nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class FarmerPreference(Base):
    __tablename__ = "farmer_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    preferred_language = Column(String(10), default="ta") # ta, en, hi, te
    notification_channel = Column(String(20), default="SMS") # SMS, WHATSAPP, PUSH
    currency = Column(String(10), default="INR")
    unit_system = Column(String(20), default="METRIC") # METRIC, LOCAL
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FarmerFeedback(Base):
    __tablename__ = "farmer_feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), default="GENERAL") # BUG, FEATURE, PRICING, APP_UX, AGRONOMY
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)


class DataCollectionEvent(Base):
    __tablename__ = "data_collection_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False) # FARM_ADD, CROP_ADD, OBSERVATION, HARVEST, ORDER, AI_QUERY
    source = Column(String(50), default="WEB_APP") # WEB_APP, ANDROID_APP, VOICE_INTERFACE
    entity_name = Column(String(100), nullable=True)
    entity_id = Column(String(36), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MarketPriceRecord(Base):
    __tablename__ = "market_price_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    crop_name = Column(String(100), nullable=False, index=True)
    market_name = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False, default="Tamil Nadu")
    min_price = Column(Numeric(10, 2), nullable=False)
    max_price = Column(Numeric(10, 2), nullable=False)
    modal_price = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="KG")
    source_name = Column(String(100), default="AGMARKNET") # AGMARKNET, e-NAM, LOCAL_MANDI
    source_url = Column(String(500), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class WeatherSignalRecord(Base):
    __tablename__ = "weather_signal_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_name = Column(String(150), nullable=False, index=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    temperature_c = Column(Numeric(5, 2), nullable=False)
    humidity_pct = Column(Numeric(5, 2), nullable=False)
    rainfall_mm = Column(Numeric(6, 2), default=0.0)
    weather_condition = Column(String(50), default="CLEAR") # CLEAR, RAIN, CLOUDY, STORM
    extreme_alert = Column(Boolean, default=False)
    signal_date = Column(Date, default=datetime.utcnow)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class AIAssistantInteraction(Base):
    __tablename__ = "ai_assistant_interactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_message = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=False)
    intent = Column(String(50), default="AGRI_ADVISORY")
    model_name = Column(String(50), default="AgriMark-Gemini-Specialist")
    context_snapshot = Column(Text, nullable=True)
    feedback_rating = Column(Integer, nullable=True)
    latency_ms = Column(Integer, default=250)
    tool_calls_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OfflineQueueLog(Base):
    __tablename__ = "offline_queue_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    idempotency_key = Column(String(100), nullable=False, unique=True, index=True)
    action_type = Column(String(50), nullable=False)
    payload_json = Column(Text, nullable=False)
    status = Column(String(20), default="PROCESSED") # PROCESSED, DUPLICATE_IGNORED, FAILED
    processed_at = Column(DateTime, default=datetime.utcnow)
