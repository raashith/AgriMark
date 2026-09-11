from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class FarmerEconomicProfileCreate(BaseModel):
    farmer_ref: str
    farm_ref: str
    season: str = "Kharif 2026"
    gross_revenue_inr: float
    gross_cost_inr: float
    cost_breakdown: Optional[Dict[str, float]] = None


class FarmerEconomicProfileResponse(FarmerEconomicProfileCreate):
    id: str
    net_farm_income_inr: float
    profit_margin_pct: float
    created_at: datetime

    class Config:
        from_attributes = True


class OutcomeInterventionCreate(BaseModel):
    farmer_ref: str
    intervention_type: str # PRICE_ADVISORY, PEST_WARNING, IRRIGATION_REC, FPO_AGGREGATION, etc.
    recommendation: str
    confidence_score: Optional[float] = 0.95
    action_taken: Optional[str] = "YES"
    non_adoption_reason: Optional[str] = None


class OutcomeMeasurementCreate(BaseModel):
    intervention_id: str
    farmer_ref: str
    metric_name: str # NET_INCOME, YIELD, COST_SAVINGS, WATER_SAVINGS, AVOIDED_LOSS
    value: float
    evidence_status: Optional[str] = "OBSERVED" # OBSERVED, VERIFIED_OBSERVED, SELF_REPORTED, ESTIMATED, ATTRIBUTED, PROJECTED, SIMULATED
    confidence: Optional[float] = 0.90
    provenance: Optional[Dict[str, Any]] = None


class FarmerROICard(BaseModel):
    farmer_ref: str
    baseline_net_income_inr: float
    current_net_income_inr: float
    additional_net_income_inr: float
    input_savings_inr: float
    avoided_losses_inr: float
    service_cost_inr: float
    net_benefit_inr: float
    roi_ratio: float
    evidence_status: str
    confidence_score: float
    sample_size: int = 1
