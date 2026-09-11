from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.finance_allied_service import FinanceAlliedService
from backend.app.schemas.finance_allied import CreditAssessmentRequest, AlliedAssetCreate

router = APIRouter(prefix="", tags=["Finance, Insurance & Allied Agriculture OS"])

service = FinanceAlliedService()


@router.post("/finance/assess/")
@router.post("/finance/assess")
def assess_credit(req: CreditAssessmentRequest):
    return service.assess_credit_exposure(
        farmer_ref=req.farmer_ref,
        finance_product_type=req.finance_product_type,
        requested_amount_inr=req.requested_amount_inr
    )


@router.get("/allied/assets/")
@router.get("/allied/assets")
def list_allied_assets(farmer_ref: Optional[str] = Query(None)):
    return service.list_allied_assets(farmer_ref=farmer_ref)


@router.post("/allied/assets/")
@router.post("/allied/assets")
def register_allied_asset(payload: AlliedAssetCreate):
    return service.register_allied_asset(payload.model_dump())


@router.get("/rural/providers/")
@router.get("/rural/providers")
def list_rural_providers(category: Optional[str] = Query(None)):
    return service.list_service_providers(service_category=category)
