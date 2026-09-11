from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.app.services.promotion_gate_trust_service import PromotionGateTrustService
from backend.app.services.living_labs_challenge_service import LivingLabsChallengeService
from backend.app.schemas.innovation_sandbox import PromotionRequestCreate

router = APIRouter(prefix="/promotions", tags=["Production Promotion Gate"])

promotion_service = PromotionGateTrustService()
labs_challenge_service = LivingLabsChallengeService()

@router.get("")
def list_promotions():
    return promotion_service.list_promotions()

@router.post("/submit")
def submit_promotion(req: PromotionRequestCreate):
    return promotion_service.submit_promotion_request(
        project_id=req.project_id,
        target_environment=req.target_environment,
        justification=req.justification,
        evidence_links=req.evidence_links
    )

@router.post("/{promotion_id}/review")
def review_promotion(promotion_id: str, req: Dict[str, Any]):
    return promotion_service.review_and_approve_promotion(
        promotion_identifier=promotion_id,
        approver_id=req.get("approver_id", "admin-user-001"),
        decision=req.get("decision", "APPROVED"),
        review_notes=req.get("review_notes", "Passed all 10-step checks")
    )

@router.get("/living-labs")
def list_living_labs():
    return labs_challenge_service.list_living_labs()

@router.get("/challenges")
def list_challenges():
    return labs_challenge_service.list_challenges()

@router.get("/funding")
def list_funding():
    return labs_challenge_service.list_funding()
