from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class BaselineInterventionService:
    """
    BaselineInterventionService:
    1. Pre-intervention baseline measurement framework
    2. Intervention model tracking (recommendation, confidence, action taken, non-adoption reasons)
    3. Farmer decision journey tracking
    """
    NON_ADOPTION_REASONS = [
        "COST", "LACK_OF_RESOURCES", "TRUST", "TIMING", "WEATHER",
        "LABOUR", "EQUIPMENT", "MARKET_CONDITIONS", "LANGUAGE", "CONNECTIVITY", "MISMATCH"
    ]

    def __init__(self):
        self._baselines: Dict[str, Dict[str, Any]] = {}
        self._interventions: Dict[str, Dict[str, Any]] = {}
        self._seed_defaults()

    def _seed_defaults(self):
        self.record_baseline("farmer-001", "TOMATO", baseline_yield=10.0, baseline_net_income=45000.00, water_use_l=15000.0)
        self.record_intervention({
            "id": "intv-001",
            "intervention_code": "INTV-SLM-PRICE-01",
            "farmer_ref": "farmer-001",
            "intervention_type": "PRICE_ADVISORY",
            "recommendation": "Hold harvest 3 days for ₹4/kg price surge at Salem Mandi",
            "confidence_score": 0.96,
            "action_taken": "YES"
        })

    def record_baseline(self, farmer_ref: str, crop_name: str, baseline_yield: float, baseline_net_income: float, water_use_l: float = 12000.0) -> Dict[str, Any]:
        b_id = str(uuid.uuid4())
        record = {
            "id": b_id,
            "farmer_ref": farmer_ref,
            "crop_name": crop_name,
            "baseline_yield_per_acre": baseline_yield,
            "baseline_net_income_inr": baseline_net_income,
            "baseline_water_use_l_per_acre": water_use_l,
            "recorded_at": datetime.utcnow().isoformat()
        }
        self._baselines[farmer_ref] = record
        return record

    def record_intervention(self, intv_data: Dict[str, Any]) -> Dict[str, Any]:
        i_id = intv_data.get("id") or str(uuid.uuid4())
        code = intv_data.get("intervention_code") or f"INTV-{i_id[:8].upper()}"

        record = {
            "id": i_id,
            "intervention_code": code,
            "farmer_ref": intv_data.get("farmer_ref"),
            "intervention_type": intv_data.get("intervention_type", "CROP_ADVISORY"),
            "recommendation": intv_data.get("recommendation"),
            "confidence_score": intv_data.get("confidence_score", 0.95),
            "decision_journey": {
                "received": True,
                "understood": True,
                "accepted": intv_data.get("action_taken") in ["YES", "PARTIAL"],
                "action_taken": intv_data.get("action_taken", "YES"),
                "non_adoption_reason": intv_data.get("non_adoption_reason")
            },
            "intervention_date": datetime.utcnow().isoformat()
        }
        self._interventions[i_id] = record
        self._interventions[code] = record
        return record

    def get_baseline(self, farmer_ref: str) -> Optional[Dict[str, Any]]:
        return self._baselines.get(farmer_ref)

    def get_intervention(self, identifier: str) -> Optional[Dict[str, Any]]:
        return self._interventions.get(identifier)
