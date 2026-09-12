from datetime import datetime, date
from typing import List, Optional, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class FarmerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    fpo_member_id: Optional[str] = None
    experience_years: Optional[int] = None
    primary_crops: Optional[str] = None
    preferred_language: Optional[str] = None


class FarmerProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    phone: str
    fpo_member_id: Optional[str] = None
    experience_years: int = 0
    primary_crops: Optional[str] = None
    verification_status: str = "unverified"
    preferred_language: str = "en"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmerDocumentCreate(BaseModel):
    document_type: str # LAND_RECORD, ID_PROOF, BANK_PASSBOOK, CERTIFICATE
    title: str
    file_url: str


class FarmerDocumentResponse(BaseModel):
    id: str
    farmer_id: str
    document_type: str
    title: str
    file_url: str
    verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmerPreferenceUpdate(BaseModel):
    preferred_language: Optional[str] = None # ta, en, hi, te
    notification_channel: Optional[str] = None # SMS, WHATSAPP, PUSH
    currency: Optional[str] = None
    unit_system: Optional[str] = None


class FarmerPreferenceResponse(BaseModel):
    id: str
    farmer_id: str
    preferred_language: str
    notification_channel: str
    currency: str
    unit_system: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmerFeedbackCreate(BaseModel):
    category: str = "GENERAL"
    message: str
    rating: int = 5


class FarmerFeedbackResponse(BaseModel):
    id: str
    farmer_id: str
    category: str
    message: str
    rating: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MarketPriceResponse(BaseModel):
    id: str
    crop_name: str
    market_name: str
    district: str
    state: str
    min_price: Decimal
    max_price: Decimal
    modal_price: Decimal
    unit: str
    source_name: str
    source_url: Optional[str] = None
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BestMarketResponse(BaseModel):
    crop_name: str
    recommended_market: str
    district: str
    modal_price: Decimal
    estimated_distance_km: float
    demand_index: str # HIGH, MEDIUM, NORMAL
    net_realization_estimate_per_kg: Decimal
    recommendation_reason: str
    data_source: str


class PricePredictionResponse(BaseModel):
    crop_name: str
    market_name: str
    predicted_price_inr_per_kg: Decimal
    prediction_horizon_days: int
    confidence_interval_low: Decimal
    confidence_interval_high: Decimal
    mae: float
    rmse: float
    model_version: str
    training_data_period: str
    evidence_status: str


class WeatherResponse(BaseModel):
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    temperature_c: float
    humidity_pct: float
    rainfall_mm: float
    weather_condition: str
    extreme_alert: bool
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgriculturalWeatherResponse(BaseModel):
    location_name: str
    weather: WeatherResponse
    pest_disease_risk: str # LOW, MODERATE, HIGH
    irrigation_advisory: str
    spray_recommendation: str
    alert_message: Optional[str] = None


class AIAssistantQuery(BaseModel):
    query: str
    language: str = "ta-IN" # ta-IN, en-IN, hi-IN
    farm_id: Optional[str] = None
    crop_id: Optional[str] = None


class AIAssistantResponse(BaseModel):
    id: str
    query: str
    answer: str
    detected_intent: str
    context_facts: Dict[str, Any]
    recommendations: List[str]
    disclaimer: str
    recorded_at: datetime


class OfflineQueueItem(BaseModel):
    idempotency_key: str
    action_type: str # CREATE_FIELD_NOTE, CREATE_EXPENSE, CREATE_LABOUR, CREATE_TASK, RECORD_HARVEST
    payload: Dict[str, Any]


class OfflineSyncQueue(BaseModel):
    items: List[OfflineQueueItem]


class OfflineSyncResponse(BaseModel):
    processed_count: int
    duplicate_count: int
    failed_count: int
    results: List[Dict[str, Any]]


class FarmProfitabilityResponse(BaseModel):
    farm_id: str
    farm_name: str
    total_area_acres: Decimal
    total_revenue: Decimal
    total_input_cost: Decimal
    total_labor_cost: Decimal
    total_expenses: Decimal
    estimated_net_profit: Decimal
    profit_margin_pct: float
    cost_per_acre: Decimal
    break_even_price_per_kg: Optional[Decimal] = None
