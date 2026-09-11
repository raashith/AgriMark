from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.app.services.sandbox_project_service import SandboxProjectService
from backend.app.schemas.innovation_sandbox import SandboxProjectCreate

router = APIRouter(prefix="/sandbox/projects", tags=["Sandbox Projects"])

project_service = SandboxProjectService()

@router.get("")
def list_projects():
    return project_service.list_projects()

@router.post("")
def create_project(proj: SandboxProjectCreate):
    return project_service.create_project(proj.dict())

@router.get("/{project_id}")
def get_project(project_id: str):
    p = project_service.get_project(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Sandbox Project not found")
    return p

@router.post("/{project_id}/validate-boundary")
def validate_boundary(project_id: str, req: Dict[str, Any]):
    action = req.get("action", "READ_DATA")
    return project_service.validate_action_environment_boundary(project_id, action)
