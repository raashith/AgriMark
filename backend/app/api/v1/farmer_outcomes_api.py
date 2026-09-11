from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from backend.app.services.farm_economics_service import FarmEconomicsService
from backend.app.services.baseline_intervention_service import BaselineInterventionService
from backend.app.services.farmer_roi_card_service import FarmerROICardService
from backend.app.schemas.farmer_outcomes import FarmerEconomicProfileCreate

router = APIRouter(prefix="/outcomes", tags=["Farmer Outcomes"])

farm_econ_service = FarmEconomicsService()
baseline_service = BaselineInterventionService()
roi_card_service = FarmerROICardService()

@router.get("/farmer/{farmer_ref}")
def get_farmer_economics(farmer_ref: str):
    profile = farm_econ_service.get_profile(farmer_ref)
    if not profile:
        raise HTTPException(status_code=404, detail="Economic profile not found for farmer")
    return profile

@router.post("/farmer/profile")
def save_farmer_profile(req: FarmerEconomicProfileCreate):
    return farm_econ_service.calculate_and_save_profile(
        farmer_ref=req.farmer_ref,
        farm_ref=req.farm_ref,
        season=req.season,
        gross_revenue_inr=req.gross_revenue_inr,
        gross_cost_inr=req.gross_cost_inr,
        cost_breakdown=req.cost_breakdown
    )

@router.get("/roi-card/{farmer_ref}")
def get_farmer_roi_card(farmer_ref: str):
    return roi_card_service.generate_farmer_roi_card(farmer_ref)

@router.get("/national")
def get_national_impact():
    return roi_card_service.generate_national_impact_card()
