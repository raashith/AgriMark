from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class VarietyProfileCreate(BaseModel):
    variety_code: str
    crop_name: str
    species: str
    variety_name: str
    producer_name: str
    maturity_duration_days: int
    season: str
    planting_window: Optional[str] = "Kharif (June - July)"
    min_yield_kg_per_acre: float
    max_yield_kg_per_acre: float
    quality_traits: Optional[List[str]] = None
    disease_resistance: Optional[Dict[str, str]] = None
    pest_resistance: Optional[Dict[str, str]] = None
    drought_tolerance: Optional[str] = "MODERATE"
    heat_tolerance: Optional[str] = "MODERATE"
    salinity_tolerance: Optional[str] = "LOW"
    water_requirement_mm: Optional[float] = 500.0
    soil_suitability: Optional[List[str]] = None
    geographical_suitability: Optional[List[str]] = None
    evidence_level: Optional[str] = "VERIFIED"


class VarietyProfileResponse(VarietyProfileCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class SeedBatchCreate(BaseModel):
    batch_number: str
    variety_code: str
    producer_code: str
    production_year: int = 2026
    quantity_kg: float
    qr_code_hash: Optional[str] = None
    certification_status: Optional[str] = "TESTED"
    certification_ref: Optional[str] = None


class SeedTestCreate(BaseModel):
    batch_number: str
    testing_lab: str
    test_date: str
    germination_pct: float
    purity_pct: float
    moisture_pct: float
    vigor_index: Optional[float] = 100.0
    disease_contamination_pct: Optional[float] = 0.0
    certificate_reference: Optional[str] = None


class VarietyRecommendationRequest(BaseModel):
    farmer_ref: str
    crop_name: str
    season: str = "Kharif 2026"
    soil_type: str = "Alluvial"
    district: str = "Thanjavur"
    state: str = "Tamil Nadu"
    water_availability: str = "IRRIGATED"
    climate_forecast: str = "NORMAL_MONSOON"
    risk_tolerance: str = "BALANCED"


class VarietyRecommendationItem(BaseModel):
    variety_code: str
    variety_name: str
    crop_name: str
    producer_name: str
    suitability_score: float
    expected_yield_range_kg_per_acre: str # e.g., "1800 - 2200 kg/acre (Expected Range, Non-Guaranteed)"
    strengths: List[str]
    weaknesses: List[str]
    evidence_level: str
    confidence: float
    assumptions: List[str]
