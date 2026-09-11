from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class StorageVsSellRequest(BaseModel):
    crop_name: str
    quantity_kg: float
    current_market_price_inr_per_kg: float
    storage_cost_per_month_inr_per_kg: float = 0.50
    expected_price_increase_30d_pct: float = 8.5
    perishability_days: int = 45


class RouteOptimizationRequest(BaseModel):
    origin_collection_centre: str
    destination_market_or_processor: str
    produce_type: str
    quantity_mt: float
    is_perishable: bool = True
