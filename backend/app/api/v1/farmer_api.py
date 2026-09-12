from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.security.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.farm_operations import Farm, Crop, FieldObservation, FarmInputLog, FarmLaborLog, FarmTask, HarvestBatch, FarmerFinanceEntry
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
from backend.app.schemas.farmer_data import (
    FarmerProfileUpdate, FarmerProfileResponse,
    FarmerDocumentCreate, FarmerDocumentResponse,
    FarmerPreferenceUpdate, FarmerPreferenceResponse,
    FarmerFeedbackCreate, FarmerFeedbackResponse,
    OfflineSyncQueue, OfflineSyncResponse,
    FarmProfitabilityResponse
)
from backend.app.services.farm_operations_service import FarmOperationsService
from backend.app.services.farmer_data_service import FarmerDataService

router = APIRouter(prefix="/farmer", tags=["Farmer Data API"])


# 1. Farmer Dashboard
@router.get("/dashboard", response_model=FarmerDashboardResponse)
def get_farmer_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.get_farmer_dashboard(db, farmer_profile_id)


# 2. Profile
@router.get("/profile", response_model=FarmerProfileResponse)
def get_farmer_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmerDataService.get_farmer_profile(db, current_user)


@router.put("/profile", response_model=FarmerProfileResponse)
def update_farmer_profile(
    data: FarmerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmerDataService.update_farmer_profile(db, current_user, data)


# 3. Farms
@router.get("/farms", response_model=List[FarmResponse])
def get_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.get_farmer_farms(db, farmer_profile_id)


@router.post("/farms", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    data: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.create_farm(db, farmer_profile_id, data)


@router.get("/farms/{farm_id}", response_model=FarmResponse)
def get_farm_by_id(
    farm_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized access")
    return FarmResponse.model_validate(farm)


@router.put("/farms/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: str,
    data: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized access")

    farm.name = data.name
    farm.location_name = data.location_name
    if data.latitude is not None:
        farm.latitude = data.latitude
    if data.longitude is not None:
        farm.longitude = data.longitude
    farm.total_area_acres = data.total_area_acres
    if data.soil_type:
        farm.soil_type = data.soil_type
    if data.irrigation_source:
        farm.irrigation_source = data.irrigation_source

    db.commit()
    db.refresh(farm)
    return FarmResponse.model_validate(farm)


# 4. Crops
@router.get("/crops", response_model=List[CropResponse])
def get_all_farmer_crops(
    farm_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]

    if farm_id:
        if farm_id not in farm_ids:
            raise HTTPException(status_code=403, detail="Unauthorized access to specified farm")
        crops = db.query(Crop).filter(Crop.farm_id == farm_id).all()
    else:
        crops = db.query(Crop).filter(Crop.farm_id.in_(farm_ids)).all() if farm_ids else []

    return [CropResponse.model_validate(c) for c in crops]


@router.post("/crops", response_model=CropResponse, status_code=status.HTTP_201_CREATED)
def add_crop(
    data: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized")
    return FarmOperationsService.add_crop(db, data)


@router.put("/crops/{crop_id}", response_model=CropResponse)
def update_crop(
    crop_id: str,
    status_str: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]

    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.farm_id.in_(farm_ids)).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop record not found or unauthorized")

    if status_str:
        crop.status = status_str
    db.commit()
    db.refresh(crop)
    return CropResponse.model_validate(crop)


# 5. Field Observations / Notes
@router.get("/observations", response_model=List[FieldObservationResponse])
def get_field_observations(
    farm_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]

    query = db.query(FieldObservation).filter(FieldObservation.farm_id.in_(farm_ids)) if farm_ids else db.query(FieldObservation).filter(text("1=0"))
    if farm_id:
        query = query.filter(FieldObservation.farm_id == farm_id)

    obs_list = query.order_by(FieldObservation.observed_at.desc()).all()
    return [FieldObservationResponse.model_validate(o) for o in obs_list]


@router.post("/observations", response_model=FieldObservationResponse, status_code=status.HTTP_201_CREATED)
def record_field_observation(
    data: FieldObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized")
    return FarmOperationsService.record_field_observation(db, data)


# 6. Inputs & Labour
@router.get("/inputs", response_model=List[FarmInputLogResponse])
def get_farm_inputs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]
    inputs = db.query(FarmInputLog).filter(FarmInputLog.farm_id.in_(farm_ids)).all() if farm_ids else []
    return [FarmInputLogResponse.model_validate(i) for i in inputs]


@router.post("/inputs", response_model=FarmInputLogResponse, status_code=status.HTTP_201_CREATED)
def log_farm_input(
    data: FarmInputLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized")
    return FarmOperationsService.log_farm_input(db, data)


@router.get("/labour", response_model=List[FarmLaborLogResponse])
def get_farm_labour(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]
    logs = db.query(FarmLaborLog).filter(FarmLaborLog.farm_id.in_(farm_ids)).all() if farm_ids else []
    return [FarmLaborLogResponse.model_validate(l) for l in logs]


@router.post("/labour", response_model=FarmLaborLogResponse, status_code=status.HTTP_201_CREATED)
def log_farm_labour(
    data: FarmLaborLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized")
    return FarmOperationsService.log_farm_labor(db, data)


# 7. Tasks
@router.get("/tasks", response_model=List[FarmTaskResponse])
def get_farm_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]
    tasks = db.query(FarmTask).filter(FarmTask.farm_id.in_(farm_ids)).order_by(FarmTask.due_date.asc()).all() if farm_ids else []
    return [FarmTaskResponse.model_validate(t) for t in tasks]


@router.post("/tasks", response_model=FarmTaskResponse, status_code=status.HTTP_201_CREATED)
def create_farm_task(
    data: FarmTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.farmer_id == farmer_profile_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized")
    return FarmOperationsService.create_farm_task(db, data)


@router.patch("/tasks/{task_id}", response_model=FarmTaskResponse)
def update_task_status(
    task_id: str,
    status_str: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]

    task = db.query(FarmTask).filter(FarmTask.id == task_id, FarmTask.farm_id.in_(farm_ids)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or unauthorized")

    task.status = status_str
    if status_str == "COMPLETED":
        task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return FarmTaskResponse.model_validate(task)


# 8. Harvests
@router.get("/harvests", response_model=List[HarvestBatchResponse])
def get_harvests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]
    crops = db.query(Crop).filter(Crop.farm_id.in_(farm_ids)).all() if farm_ids else []
    crop_ids = [c.id for c in crops]

    harvests = db.query(HarvestBatch).filter(HarvestBatch.crop_id.in_(crop_ids)).all() if crop_ids else []
    return [HarvestBatchResponse.model_validate(h) for h in harvests]


@router.post("/harvests", response_model=HarvestBatchResponse, status_code=status.HTTP_201_CREATED)
def record_harvest(
    data: HarvestBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    farms = db.query(Farm).filter(Farm.farmer_id == farmer_profile_id).all()
    farm_ids = [f.id for f in farms]
    crop = db.query(Crop).filter(Crop.id == data.crop_id, Crop.farm_id.in_(farm_ids)).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found or unauthorized")
    return FarmOperationsService.record_harvest(db, data)


# 9. Finance & Profitability
@router.get("/finance", response_model=List[FarmerFinanceEntryResponse])
def get_finance_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    entries = db.query(FarmerFinanceEntry).filter(FarmerFinanceEntry.farmer_id == farmer_profile_id).order_by(FarmerFinanceEntry.entry_date.desc()).all()
    return [FarmerFinanceEntryResponse.model_validate(e) for e in entries]


@router.post("/finance", response_model=FarmerFinanceEntryResponse, status_code=status.HTTP_201_CREATED)
def record_finance_entry(
    data: FarmerFinanceEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmOperationsService.record_finance_entry(db, farmer_profile_id, data)


@router.get("/profitability", response_model=List[FarmProfitabilityResponse])
def get_farm_profitability(
    farm_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.get_farm_profitability(db, farmer_profile_id, farm_id)


# 10. Documents & Preferences
@router.get("/documents", response_model=List[FarmerDocumentResponse])
def list_farmer_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.list_documents(db, farmer_profile_id)


@router.post("/documents", response_model=FarmerDocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_farmer_document(
    data: FarmerDocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.upload_document(db, current_user, farmer_profile_id, data)


@router.get("/preferences", response_model=FarmerPreferenceResponse)
def get_farmer_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.get_preferences(db, farmer_profile_id)


@router.put("/preferences", response_model=FarmerPreferenceResponse)
def update_farmer_preferences(
    data: FarmerPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.update_preferences(db, current_user, farmer_profile_id, data)


# 11. Feedback & Offline Sync Queue
@router.post("/feedback", response_model=FarmerFeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_farmer_feedback(
    data: FarmerFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.submit_feedback(db, current_user, farmer_profile_id, data)


@router.post("/sync-offline-queue", response_model=OfflineSyncResponse)
def sync_offline_queue(
    queue_data: OfflineSyncQueue,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return FarmerDataService.sync_offline_queue(db, current_user, queue_data)
