from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from backend.app.services.bio_research_evidence_service import BioResearchEvidenceService
from backend.app.schemas.bio_input import BioReviewSubmission

router = APIRouter(prefix="", tags=["Biological Research & Evidence Governance"])

research_service = BioResearchEvidenceService()


@router.get("/biology/research/")
@router.get("/biology/research")
def list_research_records(crop: Optional[str] = Query(None)):
    return research_service.list_research_records(crop=crop)


@router.post("/biology/research/")
@router.post("/biology/research")
def add_research_record(record_data: Dict[str, Any]):
    return research_service.add_research_record(record_data)


@router.get("/biology/evidence/")
@router.get("/biology/evidence")
def get_trust_card(entity_code: str = Query(...)):
    return research_service.get_trust_card(entity_code)


@router.post("/biology/evidence/simulation")
def run_variety_simulation(variety_a: str = Query(...), variety_b: str = Query(...), stress_scenario: str = Query("DROUGHT_INCREASE_20PCT")):
    return research_service.run_stage20_variety_simulation(variety_a, variety_b, stress_scenario)


@router.get("/biology/reviews/")
@router.get("/biology/reviews")
def list_reviews(target_code: Optional[str] = Query(None)):
    return research_service.list_expert_reviews(target_code=target_code)


@router.post("/biology/reviews/")
@router.post("/biology/reviews")
def submit_expert_review(payload: BioReviewSubmission):
    return research_service.submit_expert_review(payload.model_dump())
