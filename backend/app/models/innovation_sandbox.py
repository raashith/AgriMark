import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class InnovationOrganizationModel(Base):
    __tablename__ = "innovation_organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_code = Column(String(100), nullable=False, unique=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False) # STARTUP, RESEARCHER, UNIVERSITY, KVK, FPO, NGO, GOVT, ENTERPRISE, MODEL_PROVIDER, etc.
    legal_metadata = Column(JSON, nullable=True)
    contact_info = Column(JSON, nullable=True)
    verified_status = Column(String(20), default="UNVERIFIED")
    trust_status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SandboxProjectModel(Base):
    __tablename__ = "sandbox_projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_code = Column(String(100), nullable=False, unique=True)
    title = Column(String(150), nullable=False)
    owner_id = Column(String(36), nullable=False)
    org_id = Column(String(36), ForeignKey("innovation_organizations.id"), nullable=False)
    environment = Column(String(20), default="SANDBOX") # SANDBOX, VALIDATION, STAGING, PILOT, PRODUCTION
    purpose = Column(String(100), nullable=False)
    crop_domains = Column(JSON, nullable=True)
    geography = Column(String(100), nullable=True)
    status = Column(String(20), default="ACTIVE")
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SandboxDatasetModel(Base):
    __tablename__ = "sandbox_datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_code = Column(String(100), nullable=False, unique=True)
    title = Column(String(150), nullable=False)
    provider_org_id = Column(String(36), ForeignKey("innovation_organizations.id"), nullable=False)
    domain = Column(String(50), nullable=False)
    is_synthetic = Column(Boolean, default=False)
    schema_ref = Column(String(100), nullable=True)
    geography = Column(String(100), nullable=True)
    quality_score = Column(Numeric(5, 2), default=95.0)
    license_type = Column(String(50), default="SANDBOX_ONLY")
    created_at = Column(DateTime, default=datetime.utcnow)


class InnovationPromotionModel(Base):
    __tablename__ = "innovation_promotions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    promotion_code = Column(String(100), nullable=False, unique=True)
    project_id = Column(String(36), ForeignKey("sandbox_projects.id"), nullable=False)
    target_environment = Column(String(20), nullable=False) # VALIDATION, STAGING, PILOT, PRODUCTION
    status = Column(String(20), default="SUBMITTED") # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PILOT, STAGING, PRODUCTION, ROLLED_BACK
    reviews_summary = Column(JSON, nullable=True)
    human_approver_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
