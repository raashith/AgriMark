from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class BioProductCreate(BaseModel):
    product_code: str
    product_name: str
    product_type: str # biofertilizer, biopesticide, biostimulant, microbial_consortium, microbial_seed_coating, soil_biological_input
    manufacturer: str
    composition_metadata: Optional[Dict[str, Any]] = None
    storage_instructions: Optional[str] = None
    application_method: Optional[str] = "Soil drenching / Foliar spray"
    compatibility_notes: Optional[List[str]] = None
    approval_status: Optional[str] = "RESEARCH_ONLY"


class BioProductResponse(BioProductCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class BioProductEvidenceCreate(BaseModel):
    id_code: str
    product_code: str
    trial_ref: Optional[str] = None
    baseline_yield: float
    control_yield: float
    treatment_yield: float
    yield_delta_pct: float
    disease_reduction_pct: Optional[float] = 0.0
    soil_biological_activity_delta: Optional[float] = 0.0
    evidence_level: Optional[str] = "TRIAL"


class SoilBiologyRecordCreate(BaseModel):
    record_code: str
    farm_ref: str
    soil_organic_carbon_pct: float
    microbial_respiration_index: float
    biological_activity_score: float
    nutrient_cycling_capacity: Optional[str] = "HIGH"
    measurement_type: Optional[str] = "MEASURED"


class SeedAuthenticityLookup(BaseModel):
    batch_number: str
    scanned_qr_hash: Optional[str] = None
    scanner_location: Optional[str] = None


class SeedAuthenticityResult(BaseModel):
    batch_number: str
    variety_code: str
    producer_name: str
    is_authentic: bool
    certification_status: str
    risk_status: str # VERIFIED_VALID, RISK_FLAG, SUSPICIOUS
    flag_reason: Optional[str] = None
    provenance_chain: List[Dict[str, Any]]
    test_summary: Optional[Dict[str, Any]] = None


class BioReviewSubmission(BaseModel):
    review_id: str
    target_type: str # VARIETY, BIO_PRODUCT, SCIENTIFIC_CLAIM, RECOMMENDATION
    target_code: str
    reviewer_role: str # agronomist, plant_breeder, soil_scientist, plant_pathologist, entomologist, biotechnologist
    reviewer_name: str
    action: str # APPROVE, REJECT, REQUEST_MORE_EVIDENCE, LIMIT_SCOPE
    comments: Optional[str] = None
