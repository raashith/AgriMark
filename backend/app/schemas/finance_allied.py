from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class CreditAssessmentRequest(BaseModel):
    farmer_ref: str
    finance_product_type: str = "CROP_FINANCE" # WORKING_CAPITAL, CROP_FINANCE, WAREHOUSE_BACKED, TRADE_FINANCE, EQUIPMENT_FINANCE
    requested_amount_inr: float
    crop_name: str = "Paddy"
    land_area_acres: float = 3.5


class AlliedAssetCreate(BaseModel):
    farmer_ref: str
    allied_category: str # LIVESTOCK, DAIRY, POULTRY, FISHERIES, AQUACULTURE, BEEKEEPING, AGROFORESTRY
    head_count_or_scale: int
    health_status: Optional[str] = "HEALTHY"
    monthly_yield_units: Optional[float] = 450.0
    yield_unit: Optional[str] = "LITERS"
