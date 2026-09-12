from datetime import datetime, date
from typing import List, Optional, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class PilotCohortCreate(BaseModel):
    pilot_code: str
    name: str
    district: str
    target_farmers: int = 50


class PilotCohortResponse(BaseModel):
    id: str
    pilot_code: str
    name: str
    district: str
    target_farmers: int
    status: str
    start_date: date
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PilotParticipantOnboard(BaseModel):
    cohort_code: str = "PILOT-TN-COIMBATORE-01"
    participant_role: str = "FARMER" # FARMER, BUYER, LOGISTICS
    consent_version: str = "v1.0"
    consent_granted: bool = True
    voice_preference: bool = False
    notes: Optional[str] = None


class PilotParticipantResponse(BaseModel):
    id: str
    cohort_id: str
    user_id: str
    participant_role: str
    onboarding_date: date
    consent_version: str
    consent_granted: bool
    voice_preference: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIFeedbackRecordCreate(BaseModel):
    interaction_id: Optional[str] = None
    farmer_question: str
    context_snapshot: Optional[str] = None
    recommendation: str
    model_version: str = "AgriMark-Gemini-Pilot-v1"
    farmer_feedback_rating: Optional[int] = 5
    action_taken: str = "ACTED_UPON"
    outcome_observed: Optional[str] = None


class AIFeedbackRecordResponse(BaseModel):
    id: str
    user_id: str
    farmer_question: str
    recommendation: str
    model_version: str
    farmer_feedback_rating: Optional[int] = None
    action_taken: str
    outcome_observed: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MarketFeedbackRecordCreate(BaseModel):
    crop_name: str
    market_name: str
    observed_price: Decimal
    recommended_market: Optional[str] = None
    listing_price: Optional[Decimal] = None
    buyer_offer_price: Optional[Decimal] = None
    final_transaction_price: Decimal
    quantity_sold_kg: Decimal
    time_to_sale_hours: float = 24.0


class MarketFeedbackRecordResponse(BaseModel):
    id: str
    crop_name: str
    market_name: str
    observed_price: Decimal
    final_transaction_price: Decimal
    quantity_sold_kg: Decimal
    time_to_sale_hours: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgriOutcomeTrackCreate(BaseModel):
    farm_id: str
    crop_id: str
    harvest_batch_id: Optional[str] = None
    yield_kg: Decimal
    quality_grade: str = "PREMIUM"
    input_cost: Decimal = Decimal("0.0")
    labor_cost: Decimal = Decimal("0.0")
    irrigation_cost: Decimal = Decimal("0.0")
    selling_price_per_kg: Decimal
    crop_loss_kg: Decimal = Decimal("0.0")
    rejection_reason: Optional[str] = None
    farmer_satisfaction_rating: int = 5


class AgriOutcomeTrackResponse(BaseModel):
    id: str
    farmer_id: str
    farm_id: str
    crop_id: str
    yield_kg: Decimal
    quality_grade: str
    gross_revenue: Decimal
    net_profit: Decimal
    farmer_satisfaction_rating: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PilotDashboardResponse(BaseModel):
    active_cohorts: int
    active_farmers: int
    registered_farms: int
    cultivated_acres: float
    active_crops: int
    field_observations_count: int
    ai_interactions_count: int
    marketplace_listings_count: int
    confirmed_orders_count: int
    total_yield_harvested_kg: float
    total_farmer_profit_inr: Decimal
    data_completeness_pct: float
    system_error_rate_pct: float


class DataQualityIssue(BaseModel):
    issue_type: str # MISSING_FIELDS, INVALID_COORDINATES, IMPOSSIBLE_ACREAGE, ORPHANED_RECORD, DUPLICATE
    entity: str
    entity_id: str
    description: str
    severity: str # LOW, MEDIUM, HIGH, CRITICAL


class DataQualityReportResponse(BaseModel):
    total_records_checked: int
    clean_records_pct: float
    issues_found: List[DataQualityIssue]
    generated_at: datetime


class AIDatasetReadinessResponse(BaseModel):
    total_usable_observations: int
    completed_crop_cycles: int
    harvest_outcomes_count: int
    market_price_observations: int
    labeled_pest_disease_cases: int
    profitable_outcomes_count: int
    missingness_pct: float
    geographic_districts_covered: List[str]
    crops_covered: List[str]
    readiness_status: str # NOT_READY, IN_PROGRESS, PILOT_READY, PRODUCTION_DATASET_READY
    dataset_version: str
