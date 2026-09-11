from fastapi import APIRouter
from typing import Dict, Any
from backend.app.services.ai_impact_calculator import AIImpactCalculator
from backend.app.services.counterfactual_evaluation_service import CounterfactualEvaluationService
from backend.app.services.evidence_attribution_service import EvidenceAttributionService
from backend.app.services.model_economic_link_service import ModelEconomicLinkService

router = APIRouter(prefix="/impact", tags=["AI Impact & Counterfactuals"])

counterfactual_service = CounterfactualEvaluationService()
evidence_service = EvidenceAttributionService()
model_link_service = ModelEconomicLinkService()

@router.post("/calculate-roi")
def calculate_roi(req: Dict[str, Any]):
    return AIImpactCalculator.calculate_farmer_roi(
        post_intervention_income=req.get("post_intervention_income", 62500.0),
        baseline_income=req.get("baseline_income", 45000.0),
        input_savings=req.get("input_savings", 4500.0),
        avoided_losses=req.get("avoided_losses", 6000.0),
        service_cost=req.get("service_cost", 500.0)
    )

@router.post("/counterfactual/diff-in-diff")
def evaluate_diff_in_diff(req: Dict[str, Any]):
    return counterfactual_service.evaluate_difference_in_differences(
        treatment_before=req.get("treatment_before", 45000.0),
        treatment_after=req.get("treatment_after", 62500.0),
        control_before=req.get("control_before", 44000.0),
        control_after=req.get("control_after", 45000.0),
        sample_size_treatment=req.get("sample_size_treatment", 50),
        sample_size_control=req.get("sample_size_control", 50)
    )

@router.post("/attribution")
def attribute_impact(req: Dict[str, Any]):
    return evidence_service.attribute_impact_drivers(
        net_income_gain=req.get("net_income_gain", 17500.0),
        contributors=req.get("contributors", {"ai_recommendation": 10000.0, "market_surge": 5000.0, "input_efficiency": 2500.0})
    )

@router.get("/models")
def list_model_economic_outcomes():
    return model_link_service.list_model_outcomes()
