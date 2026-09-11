from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.services.fairness_fraud_control_service import FairnessFraudControlService

router = APIRouter(prefix="/fairness", tags=["Outcome Disparity & Fraud Control"])

fairness_service = FairnessFraudControlService()

@router.post("/disparity")
def evaluate_disparity(req: Dict[str, Any]):
    return fairness_service.evaluate_smallholder_fairness_disparity(
        smallholder_outcomes=req.get("smallholder_outcomes", [14000.0, 16500.0, 15000.0]),
        large_farmer_outcomes=req.get("large_farmer_outcomes", [18000.0, 20000.0, 19500.0])
    )

@router.post("/detect-anomaly")
def detect_anomaly(req: Dict[str, Any]):
    return fairness_service.detect_outcome_anomalies(
        farmer_ref=req.get("farmer_ref", "farmer-999"),
        reported_yield_per_acre=req.get("reported_yield_per_acre", 12.0),
        reported_price_per_kg=req.get("reported_price_per_kg", 25.0)
    )

@router.get("/anomalies")
def get_flagged_anomalies():
    return fairness_service.get_flagged_anomalies()
