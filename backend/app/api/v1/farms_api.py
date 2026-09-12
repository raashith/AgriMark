from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.security.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.farm_operations import (
    FarmCreate, FarmResponse, CropCreate, CropResponse,
    FieldObservationCreate, FieldObservationResponse,
    FarmInputLogCreate, FarmInputLogResponse,
    FarmLaborLogCreate, FarmLaborLogResponse,
    FarmTaskCreate, FarmTaskResponse,
    HarvestBatchCreate, HarvestBatchResponse,
    FarmerFinanceEntryCreate, FarmerFinanceEntryResponse,
    FarmerDashboardResponse
)
from backend.app.services.farm_operations_service import FarmOperationsService

router = APIRouter(prefix="/farms", tags=["Farmer Operations & Farm Management"])


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    data: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.create_farm(db, farmer_profile_id, data)


@router.get("", response_model=List[FarmResponse])
def get_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.get_farmer_farms(db, farmer_profile_id)


@router.post("/crops", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def add_crop(
    data: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.add_crop(db, data)


@router.get("/{farm_id}/crops", response_model=List[CropResponse])
def get_farm_crops(
    farm_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.get_farm_crops(db, farm_id)


@router.post("/field-notes", response_model=FieldObservationResponse, status_code=status.HTTP_201_CREATED)
def record_field_note(
    data: FieldObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.record_field_observation(db, data)


@router.post("/inputs", response_model=FarmInputLogResponse, status_code=status.HTTP_201_CREATED)
def log_farm_input(
    data: FarmInputLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.log_farm_input(db, data)


@router.post("/labour", response_model=FarmLaborLogResponse, status_code=status.HTTP_201_CREATED)
def log_farm_labour(
    data: FarmLaborLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.log_farm_labor(db, data)


@router.post("/tasks", response_model=FarmTaskResponse, status_code=status.HTTP_201_CREATED)
def create_farm_task(
    data: FarmTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.create_farm_task(db, data)


@router.post("/harvests", response_model=HarvestBatchResponse, status_code=status.HTTP_201_CREATED)
def record_harvest(
    data: HarvestBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmOperationsService.record_harvest(db, data)


@router.post("/expenses", response_model=FarmerFinanceEntryResponse, status_code=status.HTTP_201_CREATED)
def record_expense_entry(
    data: FarmerFinanceEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.record_finance_entry(db, farmer_profile_id, data)


@router.get("/dashboard", response_model=FarmerDashboardResponse)
def get_farmer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.get_farmer_dashboard(db, farmer_profile_id)
