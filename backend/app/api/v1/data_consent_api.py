from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from backend.app.services.consent_purpose_policy_service import ConsentPurposePolicyService
from backend.app.services.farmer_data_rights_service import FarmerDataRightsService
from backend.app.schemas.data_contract import ConsentGrantRequest

router = APIRouter(prefix="/data/consent", tags=["Data Consent & Rights"])

consent_service = ConsentPurposePolicyService()
farmer_rights_service = FarmerDataRightsService()

@router.post("/grant")
def grant_consent(req: ConsentGrantRequest):
    try:
        record = consent_service.grant_consent(
            farmer_ref=req.farmer_ref,
            consumer_id=req.consumer_id,
            data_scope=req.data_scope,
            purpose=req.purpose,
            duration_days=req.duration_days
        )
        return {"status": "SUCCESS", "consent_record": record}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/withdraw")
def withdraw_consent(farmer_ref: str, consumer_id: str, purpose: str):
    try:
        record = consent_service.withdraw_consent(farmer_ref, consumer_id, purpose)
        return {"status": "WITHDRAWN", "consent_record": record}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/farmer/{farmer_ref}")
def view_farmer_data_rights(farmer_ref: str):
    data = farmer_rights_service.view_farmer_data(farmer_ref)
    history = farmer_rights_service.get_access_history(farmer_ref)
    return {
        "farmer_data": data,
        "access_history": history
    }

@router.post("/farmer/{farmer_ref}/export")
def export_farmer_data(farmer_ref: str):
    return farmer_rights_service.export_farmer_data(farmer_ref)
