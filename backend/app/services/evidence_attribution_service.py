from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class EvidenceAttributionService:
    """
    Evidence & Attribution Service:
    1. Enforces 7-tier Evidence classification: OBSERVED, VERIFIED_OBSERVED, SELF_REPORTED, ESTIMATED, ATTRIBUTED, PROJECTED, SIMULATED.
       Strictly prevents SIMULATED or PROJECTED from becoming OBSERVED automatically.
    2. Multi-factor ImpactAttributionEngine.
    """
    EVIDENCE_TIERS = [
        "OBSERVED", "VERIFIED_OBSERVED", "SELF_REPORTED",
        "ESTIMATED", "ATTRIBUTED", "PROJECTED", "SIMULATED"
    ]

    def record_evidence(self, metric_name: str, value: float, evidence_status: str, source: str, confidence: float = 0.90) -> Dict[str, Any]:
        status_clean = evidence_status.upper()
        if status_clean not in self.EVIDENCE_TIERS:
            raise ValueError(f"Evidence status '{evidence_status}' invalid. Allowed: {self.EVIDENCE_TIERS}")

        return {
            "evidence_id": f"EVD-{uuid.uuid4().hex[:6].upper()}",
            "metric_name": metric_name,
            "value": value,
            "evidence_status": status_clean,
            "source": source,
            "confidence": confidence,
            "provenance": {
                "recorded_at": datetime.utcnow().isoformat(),
                "calculation_version": "v1.0.0"
            }
        }

    def promote_evidence_status(self, current_status: str, requested_status: str, verification_proof: Optional[str] = None) -> Dict[str, Any]:
        """
        Prevents illegal promotion of SIMULATED/PROJECTED to OBSERVED/VERIFIED.
        """
        curr = current_status.upper()
        req = requested_status.upper()

        if curr in ["SIMULATED", "PROJECTED"] and req in ["OBSERVED", "VERIFIED_OBSERVED"]:
            return {
                "promotion_allowed": False,
                "reason": f"Safety Rule: '{curr}' values cannot be promoted to '{req}' without actual physical field measurement proof.",
                "status": curr
            }

        if req == "VERIFIED_OBSERVED" and not verification_proof:
            return {
                "promotion_allowed": False,
                "reason": "VERIFIED_OBSERVED requires explicit verification_proof (invoice, weighbridge receipt, mandi slip).",
                "status": curr
            }

        return {
            "promotion_allowed": True,
            "status": req,
            "verification_proof": verification_proof
        }

    def attribute_impact_drivers(self, net_income_gain: float, contributors: Dict[str, float]) -> Dict[str, Any]:
        """
        Attributes income gain across potential contributors (AI recommendation, market conditions, weather, input costs).
        """
        total_contrib = sum(contributors.values())
        if total_contrib <= 0:
            return {"attribution_status": "UNUNIFORM", "drivers": {}}

        normalized_drivers = {}
        for driver, raw_val in contributors.items():
            pct = round((raw_val / total_contrib) * 100.0, 2)
            income_share = round(net_income_gain * (raw_val / total_contrib), 2)
            normalized_drivers[driver] = {
                "percentage_share": pct,
                "income_attributed_inr": income_share
            }

        return {
            "attribution_id": f"ATTR-{uuid.uuid4().hex[:6].upper()}",
            "net_income_gain_inr": net_income_gain,
            "primary_driver": max(contributors, key=contributors.get),
            "drivers_breakdown": normalized_drivers
        }
