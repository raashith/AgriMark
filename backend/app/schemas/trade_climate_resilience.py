from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class TradeCorridorQuery(BaseModel):
    destination_country: str = "United Arab Emirates"
    commodity: str = "Non-Basmati Rice"
    quantity_mt: float = 500.0


class CircularFlowCreate(BaseModel):
    waste_source_type: str # CROP_RESIDUE, ANIMAL_WASTE, FOOD_WASTE, PROCESSING_WASTE
    quantity_mt: float
    destination_product: str # COMPOST, BIOFERTILIZER, BIOGAS, CBG, ANIMAL_FEED, BIOMATERIALS
    processor_name: str


class ClimateRiskEvaluationRequest(BaseModel):
    district: str = "Thanjavur"
    hazard_type: str = "DROUGHT" # HEAT, DROUGHT, FLOOD, CYCLONE, EXTREME_RAINFALL, PEST_AMPLIFICATION
    forecast_horizon_days: int = 60
