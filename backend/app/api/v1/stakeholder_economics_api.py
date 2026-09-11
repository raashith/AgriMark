from fastapi import APIRouter
from typing import Dict, Any
from backend.app.services.stakeholder_economics_service import StakeholderEconomicsService

router = APIRouter(prefix="/economics", tags=["Stakeholder & Resource Economics"])

stakeholder_service = StakeholderEconomicsService()

@router.post("/fpo")
def calculate_fpo_outcomes(req: Dict[str, Any]):
    return stakeholder_service.calculate_fpo_aggregation_outcomes(
        fpo_code=req.get("fpo_code", "FPO_SALEM_01"),
        member_count=req.get("member_count", 120),
        total_volume_quintals=req.get("total_volume_quintals", 1500.0),
        unaggregated_avg_price=req.get("unaggregated_avg_price", 22.0),
        aggregated_realized_price=req.get("aggregated_realized_price", 26.5)
    )

@router.post("/buyer")
def calculate_buyer_outcomes(req: Dict[str, Any]):
    return stakeholder_service.calculate_buyer_procurement_outcomes(
        buyer_id=req.get("buyer_id", "buyer-100"),
        baseline_landed_cost=req.get("baseline_landed_cost", 28.0),
        optimized_landed_cost=req.get("optimized_landed_cost", 24.5),
        volume_tonnes=req.get("volume_tonnes", 150.0)
    )

@router.post("/post-harvest")
def calculate_post_harvest_outcomes(req: Dict[str, Any]):
    return stakeholder_service.calculate_post_harvest_loss_outcomes(
        harvested_kg=req.get("harvested_kg", 5000.0),
        rejected_spoiled_kg=req.get("rejected_spoiled_kg", 350.0),
        price_per_kg=req.get("price_per_kg", 25.0)
    )
