import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class DataProviderModel(Base):
    __tablename__ = "data_providers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_id = Column(String(100), nullable=False, unique=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False) # GOVERNMENT, RESEARCH, FPO, PRIVATE_COMPANY, BANK, INSURER, DEVICE, SATELLITE, etc.
    jurisdiction = Column(String(100), default="IN")
    ownership = Column(String(100), nullable=True)
    authority = Column(String(100), nullable=True)
    contact = Column(JSON, nullable=True)
    data_domains = Column(JSON, nullable=True)
    api_capabilities = Column(JSON, nullable=True)
    trust_level = Column(String(20), default="UNVERIFIED") # HIGH, MEDIUM, LOW, UNVERIFIED
    legal_basis = Column(String(100), nullable=True)
    consent_requirements = Column(String(100), nullable=True)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DataConsumerModel(Base):
    __tablename__ = "data_consumers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    consumer_id = Column(String(100), nullable=False, unique=True)
    name = Column(String(150), nullable=False)
    organization = Column(String(150), nullable=True)
    purpose_declarations = Column(JSON, nullable=True)
    permissions = Column(JSON, nullable=True)
    retention_days = Column(Integer, default=365)
    allowed_transformations = Column(JSON, nullable=True)
    audit_state = Column(String(20), default="COMPLIANT")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DataProductModel(Base):
    __tablename__ = "data_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_code = Column(String(100), nullable=False, unique=True)
    title = Column(String(150), nullable=False)
    owner_id = Column(String(36), nullable=False)
    provider_id = Column(String(36), ForeignKey("data_providers.id"), nullable=False)
    schema_ref = Column(String(100), nullable=False)
    version = Column(String(20), default="1.0.0")
    quality_score = Column(Numeric(5, 2), default=95.0)
    freshness_tier = Column(String(20), default="HOURLY")
    coverage_geo = Column(String(100), nullable=True)
    license_type = Column(String(50), default="RESTRICTED")
    access_policy = Column(JSON, nullable=True)
    pricing_model = Column(String(50), default="FREE")
    provenance_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class DataSchemaModel(Base):
    __tablename__ = "data_schemas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    schema_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    domain = Column(String(50), nullable=False)
    canonical_version = Column(String(20), default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)


class DataSchemaVersionModel(Base):
    __tablename__ = "data_schema_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    schema_id = Column(String(36), ForeignKey("data_schemas.id"), nullable=False)
    version = Column(String(20), nullable=False)
    fields_definition = Column(JSON, nullable=False)
    compatibility = Column(String(20), default="BACKWARD") # BACKWARD, FORWARD, FULL, NONE
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)


class DataIncidentModel(Base):
    __tablename__ = "data_incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_code = Column(String(100), nullable=False, unique=True)
    incident_type = Column(String(50), nullable=False) # POISONING, LEAK, CORRUPTION, SCHEMA_BREAK, QUALITY_FAILURE, CONSENT_FAILURE
    severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    affected_product_id = Column(String(36), nullable=True)
    status = Column(String(20), default="DETECTED") # DETECTED, CONTAINED, ASSESSED, REMEDIATED, VERIFIED, CLOSED
    description = Column(Text, nullable=True)
    remediation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
