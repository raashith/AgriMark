import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from backend.app.core.database import Base


class LogisticsFacilityModel(Base):
    __tablename__ = "logistics_networks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_code = Column(String(100), nullable=False, unique=True, index=True)
    facility_name = Column(String(150), nullable=False)
    facility_type = Column(String(50), nullable=False) # PACKHOUSE, WAREHOUSE, COLD_STORAGE, COLLECTION_CENTRE, PROCESSING_PLANT
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    total_capacity_mt = Column(Numeric(12, 2), nullable=False)
    available_capacity_mt = Column(Numeric(12, 2), nullable=False)
    cold_chain_capable = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReeferTransportModel(Base):
    __tablename__ = "reefer_transports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_code = Column(String(100), nullable=False, unique=True, index=True)
    transporter_name = Column(String(150), nullable=False)
    vehicle_type = Column(String(50), default="REEFER_TRUCK")
    payload_capacity_mt = Column(Numeric(10, 2), nullable=False)
    temperature_range_c = Column(String(50), default="-5C to +15C")
    gps_telemetry_enabled = Column(Boolean, default=True)
    status = Column(String(30), default="AVAILABLE")
    created_at = Column(DateTime, default=datetime.utcnow)
