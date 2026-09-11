import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Boolean, Numeric, Integer
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class SeedVarietyModel(Base):
    __tablename__ = "seed_varieties"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    variety_code = Column(String(100), nullable=False, unique=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    species = Column(String(100), nullable=False)
    variety_name = Column(String(150), nullable=False)
    producer_name = Column(String(150), nullable=False)
    maturity_duration_days = Column(Integer, nullable=False)
    season = Column(String(50), nullable=False)
    planting_window = Column(String(100), nullable=True)
    min_yield_kg_per_acre = Column(Numeric(10, 2), nullable=True)
    max_yield_kg_per_acre = Column(Numeric(10, 2), nullable=True)
    quality_traits = Column(JSON, nullable=True)
    disease_resistance = Column(JSON, nullable=True)
    pest_resistance = Column(JSON, nullable=True)
    drought_tolerance = Column(String(50), default="MODERATE")
    heat_tolerance = Column(String(50), default="MODERATE")
    salinity_tolerance = Column(String(50), default="LOW")
    water_requirement_mm = Column(Numeric(8, 2), nullable=True)
    soil_suitability = Column(JSON, nullable=True)
    geographical_suitability = Column(JSON, nullable=True)
    evidence_level = Column(String(30), default="VERIFIED") # OBSERVED, VERIFIED, RESEARCH, TRIAL, ESTIMATED, SIMULATED, PROJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SeedBatchModel(Base):
    __tablename__ = "seed_batches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_number = Column(String(100), nullable=False, unique=True, index=True)
    variety_code = Column(String(100), nullable=False, index=True)
    producer_code = Column(String(100), nullable=False)
    production_year = Column(Integer, nullable=False)
    quantity_kg = Column(Numeric(12, 2), nullable=False)
    qr_code_hash = Column(String(128), unique=True, nullable=True)
    certification_status = Column(String(50), default="TESTED")
    certification_ref = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SeedTestModel(Base):
    __tablename__ = "seed_tests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_code = Column(String(100), nullable=False, unique=True)
    batch_number = Column(String(100), nullable=False, index=True)
    testing_lab = Column(String(150), nullable=False)
    test_date = Column(DateTime, nullable=False)
    germination_pct = Column(Numeric(5, 2), nullable=False)
    purity_pct = Column(Numeric(5, 2), nullable=False)
    moisture_pct = Column(Numeric(5, 2), nullable=False)
    vigor_index = Column(Numeric(8, 2), nullable=True)
    disease_contamination_pct = Column(Numeric(5, 2), default=0.00)
    certificate_reference = Column(String(100), nullable=True)
    passed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GermplasmAccessionModel(Base):
    __tablename__ = "germplasm_accessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    accession_number = Column(String(100), nullable=False, unique=True, index=True)
    species = Column(String(100), nullable=False)
    source_origin = Column(String(100), nullable=False)
    population_type = Column(String(50), nullable=True)
    conservation_status = Column(String(50), default="ACTIVE")
    utilization_history = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TraitOntologyModel(Base):
    __tablename__ = "trait_ontology"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trait_code = Column(String(100), nullable=False, unique=True, index=True)
    category = Column(String(50), nullable=False)
    trait_name = Column(String(150), nullable=False)
    parent_trait_code = Column(String(100), nullable=True)
    synonyms = Column(JSON, nullable=True)
    tamil_aliases = Column(JSON, nullable=True)
    regional_terms = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
