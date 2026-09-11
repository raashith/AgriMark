import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class DataContractModel(Base):
    __tablename__ = "data_contracts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_code = Column(String(100), nullable=False, unique=True)
    provider_id = Column(String(36), ForeignKey("data_providers.id"), nullable=False)
    consumer_id = Column(String(36), ForeignKey("data_consumers.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("data_products.id"), nullable=False)
    purpose = Column(String(50), nullable=False) # ADVISORY, CREDIT, INSURANCE, RESEARCH, POLICY_ANALYSIS, MODEL_TRAINING
    scope = Column(JSON, nullable=True)
    fields_allowed = Column(JSON, nullable=True)
    geography = Column(String(100), nullable=True)
    time_range = Column(JSON, nullable=True)
    frequency = Column(String(50), default="ON_DEMAND")
    retention_days = Column(Integer, default=90)
    processing_permissions = Column(JSON, nullable=True)
    sharing_permissions = Column(JSON, nullable=True)
    consent_required = Column(Boolean, default=True)
    security_requirements = Column(JSON, nullable=True)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DataConsentRecordModel(Base):
    __tablename__ = "data_consent_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_ref = Column(String(100), nullable=False, index=True)
    consumer_id = Column(String(36), ForeignKey("data_consumers.id"), nullable=False)
    data_scope = Column(JSON, nullable=False)
    purpose = Column(String(50), nullable=False)
    duration_days = Column(Integer, default=365)
    status = Column(String(20), default="GRANTED") # GRANTED, DENIED, WITHDRAWN, EXPIRED, REVOKED
    granted_at = Column(DateTime, default=datetime.utcnow)
    withdrawn_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DataAccessRequestModel(Base):
    __tablename__ = "data_access_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = Column(String(36), nullable=False)
    purpose = Column(String(50), nullable=False)
    dataset_id = Column(String(36), nullable=False)
    requested_fields = Column(JSON, nullable=True)
    geography = Column(String(100), nullable=True)
    duration_days = Column(Integer, default=30)
    decision = Column(String(30), default="REQUESTED") # REQUESTED, UNDER_REVIEW, APPROVED, PARTIALLY_APPROVED, REJECTED, EXPIRED, REVOKED
    reviewer_id = Column(String(36), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
