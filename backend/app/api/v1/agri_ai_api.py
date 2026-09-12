from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.security.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.farmer_data import AIAssistantQuery, AIAssistantResponse
from backend.app.services.farm_operations_service import FarmOperationsService
from backend.app.services.farmer_data_service import FarmerDataService

router = APIRouter(prefix="/agri-ai", tags=["AgriAI Farm-Aware Assistant"])


@router.post("/chat", response_model=AIAssistantResponse)
def agri_ai_chat(
    data: AIAssistantQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farmer_profile_id = FarmOperationsService.get_or_create_farmer_profile_id(db, current_user)
    return FarmerDataService.process_agri_ai_chat(db, current_user, farmer_profile_id, data)
