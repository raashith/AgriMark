from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# FARM SCHEMAS
# ==========================================

class FarmBase(BaseModel):
    name: str = Field(..., max_length=100)
    location_name: str = Field(..., max_length=255)
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    total_area_acres: Decimal = Field(..., gt=0)
    soil_type: Optional[str] = None
    irrigation_source: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmResponse(FarmBase):
    id: str
    farmer_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# CROP SCHEMAS
# ==========================================

class CropBase(BaseModel):
    farm_id: str
    name: str = Field(..., max_length=100)
    variety: Optional[str] = None
    sowing_date: date
    expected_harvest_date: Optional[date] = None
    acreage: Decimal = Field(..., gt=0)
    status: str = "PLANTED"

class CropCreate(CropBase):
    pass

class CropResponse(CropBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# FIELD OBSERVATION SCHEMAS
# ==========================================

class FieldObservationBase(BaseModel):
    farm_id: str
    crop_id: Optional[str] = None
    crop_stage: Optional[str] = None
    observation_type: str = "GENERAL"
    severity: str = "LOW"
    notes: str
    photo_url: Optional[str] = None

class FieldObservationCreate(FieldObservationBase):
    pass

class FieldObservationResponse(FieldObservationBase):
    id: str
    ai_assessment: Optional[str] = None
    observed_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# FARM INPUT LOG SCHEMAS
# ==========================================

class FarmInputLogBase(BaseModel):
    farm_id: str
    crop_id: Optional[str] = None
    input_type: str
    product_name: str
    quantity_used: Decimal = Field(..., gt=0)
    unit: str
    cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    applied_date: Optional[date] = None

class FarmInputLogCreate(FarmInputLogBase):
    pass

class FarmInputLogResponse(FarmInputLogBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# FARM LABOUR LOG SCHEMAS
# ==========================================

class FarmLaborLogBase(BaseModel):
    farm_id: str
    crop_id: Optional[str] = None
    task_type: str
    worker_count: int = Field(default=1, ge=1)
    hours_worked: Decimal = Field(..., gt=0)
    labor_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    work_date: Optional[date] = None

class FarmLaborLogCreate(FarmLaborLogBase):
    pass

class FarmLaborLogResponse(FarmLaborLogBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# FARM TASK SCHEMAS
# ==========================================

class FarmTaskBase(BaseModel):
    farm_id: str
    crop_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: date
    priority: str = "MEDIUM"
    status: str = "PENDING"

class FarmTaskCreate(FarmTaskBase):
    pass

class FarmTaskResponse(FarmTaskBase):
    id: str
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# HARVEST BATCH SCHEMAS
# ==========================================

class HarvestBatchBase(BaseModel):
    crop_id: str
    harvest_date: date
    quantity_harvested_kg: Decimal = Field(..., gt=0)
    quality_grade: str = "STANDARD"
    wastage_kg: Decimal = Field(default=Decimal("0.00"), ge=0)
    storage_method: Optional[str] = None
    notes: Optional[str] = None

class HarvestBatchCreate(HarvestBatchBase):
    pass

class HarvestBatchResponse(HarvestBatchBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# FARMER FINANCE ENTRY SCHEMAS
# ==========================================

class FarmerFinanceEntryBase(BaseModel):
    farm_id: Optional[str] = None
    crop_id: Optional[str] = None
    entry_type: str # INCOME, EXPENSE
    category: str
    amount: Decimal = Field(..., gt=0)
    entry_date: Optional[date] = None
    notes: Optional[str] = None

class FarmerFinanceEntryCreate(FarmerFinanceEntryBase):
    pass

class FarmerFinanceEntryResponse(FarmerFinanceEntryBase):
    id: str
    farmer_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# FARMER DASHBOARD SUMMARY SCHEMAS
# ==========================================

class CropSummary(BaseModel):
    id: str
    name: str
    variety: Optional[str]
    acreage: Decimal
    status: str
    sowing_date: date

class TaskSummary(BaseModel):
    id: str
    title: str
    due_date: date
    priority: str
    status: str

class FarmerDashboardResponse(BaseModel):
    total_farms: int
    total_acreage: Decimal
    active_crops_count: int
    total_harvested_kg: Decimal
    total_input_cost: Decimal
    total_labor_cost: Decimal
    total_production_cost: Decimal
    total_revenue: Decimal
    net_profit: Decimal
    profit_margin_percentage: Decimal
    crops: List[CropSummary]
    upcoming_tasks: List[TaskSummary]
