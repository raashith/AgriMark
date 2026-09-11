from fastapi import APIRouter, Query
from typing import Dict, Any, List, Optional
from backend.app.services.research_sandbox_dataset_builder import ResearchSandboxDatasetBuilder
from backend.app.services.data_trust_incident_service import DataTrustIncidentService

router = APIRouter(prefix="/data/sandbox", tags=["Research Sandbox & AI Datasets"])

sandbox_service = ResearchSandboxDatasetBuilder()
incident_service = DataTrustIncidentService()

@router.get("/datasets")
def list_datasets():
    return sandbox_service.list_datasets()

@router.post("/datasets")
def create_ai_dataset(req: Dict[str, Any]):
    return sandbox_service.create_ai_dataset(
        dataset_name=req.get("dataset_name", "AI_Training_Set"),
        date_range=req.get("date_range", {"start": "2025-01-01", "end": "2025-12-31"}),
        geographies=req.get("geographies", ["IN"]),
        crops=req.get("crops", ["TOMATO"]),
        filters=req.get("filters")
    )

@router.get("/synthetic")
def generate_synthetic_data(domain: str = "CROP", sample_size: int = 10):
    return sandbox_service.generate_synthetic_data(domain=domain, sample_size=sample_size)

@router.get("/impact-graph/{dataset_id}")
def get_impact_graph(dataset_id: str):
    return sandbox_service.build_model_to_data_impact_graph(dataset_id)

@router.get("/incidents")
def list_incidents():
    return incident_service.list_incidents()
