from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from backend.app.services.developer_portal_service import DeveloperPortalService
from backend.app.schemas.innovation_sandbox import OrganizationCreate

router = APIRouter(prefix="/developer", tags=["Developer Portal"])

dev_service = DeveloperPortalService()

@router.get("/organizations")
def list_organizations():
    return dev_service.list_organizations()

@router.post("/organizations")
def register_organization(org: OrganizationCreate):
    return dev_service.register_organization(org.dict())

@router.post("/keys/generate")
def generate_api_key(req: Dict[str, Any]):
    return dev_service.generate_api_key(
        org_id=req.get("org_id", "org-startup-001"),
        project_id=req.get("project_id", "proj-sbx-001"),
        scopes=req.get("scopes", ["SANDBOX_READ", "SANDBOX_WRITE"])
    )
