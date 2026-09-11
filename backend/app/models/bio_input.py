import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from backend.app.core.database import Base


class BioProductModel(Base):
    __tablename__ = "bio_products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_code = Column(String(100), nullable=False, unique=True, index=True)
    product_name = Column(String(150), nullable=False)
    product_type = Column(String(50), nullable=False) # biofertilizer, biopesticide, biostimulant, microbial_consortium, microbial_seed_coating, soil_biological_input
    manufacturer = Column(String(150), nullable=False)
    composition_metadata = Column(JSON, nullable=True)
    storage_instructions = Column(Text, nullable=True)
    application_method = Column(String(100), nullable=True)
    compatibility_notes = Column(JSON, nullable=True)
    approval_status = Column(String(30), default="RESEARCH_ONLY") # RESEARCH_ONLY, PROVISIONAL, APPROVED, REVIEW_PENDING
    created_at = Column(DateTime, default=datetime.utcnow)


class BioProductEvidenceModel(Base):
    __tablename__ = "bio_product_evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    id_code = Column(String(100), nullable=False, unique=True, index=True)
    product_code = Column(String(100), nullable=False, index=True)
    trial_ref = Column(String(100), nullable=True)
    baseline_yield = Column(Numeric(10, 2), nullable=True)
    control_yield = Column(Numeric(10, 2), nullable=True)
    treatment_yield = Column(Numeric(10, 2), nullable=True)
    yield_delta_pct = Column(Numeric(5, 2), nullable=True)
    disease_reduction_pct = Column(Numeric(5, 2), nullable=True)
    soil_biological_activity_delta = Column(Numeric(5, 2), nullable=True)
    evidence_level = Column(String(30), default="TRIAL")
    created_at = Column(DateTime, default=datetime.utcnow)


class SoilBiologyRecordModel(Base):
    __tablename__ = "soil_biology_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    record_code = Column(String(100), nullable=False, unique=True, index=True)
    farm_ref = Column(String(100), nullable=False, index=True)
    soil_organic_carbon_pct = Column(Numeric(4, 2), nullable=True)
    microbial_respiration_index = Column(Numeric(8, 2), nullable=True)
    biological_activity_score = Column(Numeric(5, 2), nullable=True)
    nutrient_cycling_capacity = Column(String(50), nullable=True)
    measurement_type = Column(String(30), default="MEASURED") # MEASURED, ESTIMATED, MODEL_DERIVED
    measured_at = Column(DateTime, default=datetime.utcnow)


class SeedAuthenticityFlagModel(Base):
    __tablename__ = "seed_authenticity_flags"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_number = Column(String(100), nullable=False, index=True)
    risk_level = Column(String(20), default="RISK_FLAG") # RISK_FLAG, SUSPICIOUS, VERIFIED_VALID
    flag_reason = Column(String(150), nullable=False) # DUPLICATE_QR, IMPOSSIBLE_DATE, UNKNOWN_PRODUCER, GEO_ANOMALY
    details = Column(JSON, nullable=True)
    flagged_at = Column(DateTime, default=datetime.utcnow)


class BiologicalReviewModel(Base):
    __tablename__ = "biological_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    review_id = Column(String(100), nullable=False, unique=True, index=True)
    target_type = Column(String(50), nullable=False) # VARIETY, BIO_PRODUCT, SCIENTIFIC_CLAIM, RECOMMENDATION
    target_code = Column(String(100), nullable=False)
    reviewer_role = Column(String(50), nullable=False) # agronomist, plant_breeder, soil_scientist, plant_pathologist, entomologist, biotechnologist
    reviewer_name = Column(String(100), nullable=False)
    action = Column(String(30), nullable=False) # APPROVE, REJECT, REQUEST_MORE_EVIDENCE, LIMIT_SCOPE
    comments = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)
