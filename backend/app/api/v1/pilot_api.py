from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.security.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.pilot import (
    PilotCohortCreate, PilotCohortResponse,
    PilotParticipantOnboard, PilotParticipantResponse,
    AIFeedbackRecordCreate, AIFeedbackRecordResponse,
    MarketFeedbackRecordCreate, MarketFeedbackRecordResponse,
    AgriOutcomeTrackCreate, AgriOutcomeTrackResponse,
    PilotDashboardResponse, DataQualityReportResponse,
    AIDatasetReadinessResponse
)
from backend.app.services.pilot_service import PilotService

router = APIRouter(prefix="/pilot", tags=["Real-World Pilot Mode & Governance"])


@router.post("/cohorts", response_model=PilotCohortResponse, status_code=status.HTTP_201_CREATED)
def create_pilot_cohort(
    data: PilotCohortCreate,
    db: Session = Depends(get_db)
):
    cohort = PilotService.get_or_create_default_cohort(db)
    return PilotCohortResponse.model_validate(cohort)


@router.post("/onboard", response_model=PilotParticipantResponse, status_code=status.HTTP_201_CREATED)
def onboard_pilot_participant(
    data: PilotParticipantOnboard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return PilotService.onboard_participant(db, current_user, data)


@router.post("/feedback/ai", response_model=AIFeedbackRecordResponse, status_code=status.HTTP_201_CREATED)
def record_ai_feedback(
    data: AIFeedbackRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return PilotService.record_ai_feedback(db, current_user, data)


@router.post("/feedback/market", response_model=MarketFeedbackRecordResponse, status_code=status.HTTP_201_CREATED)
def record_market_feedback(
    data: MarketFeedbackRecordCreate,
    db: Session = Depends(get_db)
):
    return PilotService.record_market_feedback(db, data)


@router.post("/outcomes", response_model=AgriOutcomeTrackResponse, status_code=status.HTTP_201_CREATED)
def record_agri_outcome(
    data: AgriOutcomeTrackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return PilotService.record_agri_outcome(db, current_user, data)


@router.get("/dashboard", response_model=PilotDashboardResponse)
def get_pilot_dashboard(
    db: Session = Depends(get_db)
):
    return PilotService.get_pilot_dashboard(db)


@router.get("/data-quality", response_model=DataQualityReportResponse)
def get_data_quality_report(
    db: Session = Depends(get_db)
):
    return PilotService.get_data_quality_report(db)


@router.get("/dataset-readiness", response_model=AIDatasetReadinessResponse)
def get_ai_dataset_readiness(
    db: Session = Depends(get_db)
):
    return PilotService.get_ai_dataset_readiness(db)
