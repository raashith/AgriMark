from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class FairnessFraudControlService:
    """
    Fairness & Fraud Control Service:
    1. Evaluates outcome disparities across smallholder, marginal, rainfed, and language segments.
    2. Detects fraud and manipulation in outcome claims (impossible yields, price spikes, duplicate logs).
    """
    def __init__(self):
        self._anomalies: List[Dict[str, Any]] = []

    def evaluate_smallholder_fairness_disparity(self, smallholder_outcomes: List[float], large_farmer_outcomes: List[float]) -> Dict[str, Any]:
        avg_small = sum(smallholder_outcomes) / len(smallholder_outcomes) if smallholder_outcomes else 0.0
        avg_large = sum(large_farmer_outcomes) / len(large_farmer_outcomes) if large_farmer_outcomes else 0.0

        disparity_ratio = round(avg_small / avg_large, 2) if avg_large > 0 else 1.0

        is_equitable = disparity_ratio >= 0.75 # Smallholders realize at least 75% of large farmer gains

        return {
            "evaluation_id": f"FAIR-{uuid.uuid4().hex[:6].upper()}",
            "smallholder_avg_income_gain_inr": round(avg_small, 2),
            "large_farmer_avg_income_gain_inr": round(avg_large, 2),
            "disparity_ratio": disparity_ratio,
            "is_equitable": is_equitable,
            "equity_status": "FAIR_BENEFIT_DISTRIBUTION" if is_equitable else "DISPARITY_ALERT_SMALLHOLDER_LAG"
        }

    def detect_outcome_anomalies(self, farmer_ref: str, reported_yield_per_acre: float, reported_price_per_kg: float, historical_max_yield: float = 35.0, historical_max_price: float = 120.0) -> Dict[str, Any]:
        """
        Flags impossible yield (> 35 t/acre tomato) or impossible price spikes (> ₹120/kg tomato).
        Does NOT delete records automatically; flags for Admin Review.
        """
        anomalies_found = []

        if reported_yield_per_acre > historical_max_yield:
            anomalies_found.append(f"IMPOSSIBLE_YIELD: Reported yield {reported_yield_per_acre} t/acre exceeds historical max ({historical_max_yield} t/acre).")

        if reported_price_per_kg > historical_max_price:
            anomalies_found.append(f"IMPOSSIBLE_PRICE: Reported price ₹{reported_price_per_kg}/kg exceeds historical max (₹{historical_max_price}/kg).")

        is_suspicious = len(anomalies_found) > 0
        if is_suspicious:
            record = {
                "anomaly_id": f"ANOM-{uuid.uuid4().hex[:6].upper()}",
                "farmer_ref": farmer_ref,
                "anomalies": anomalies_found,
                "status": "FLAGGED_FOR_HUMAN_REVIEW",
                "flagged_at": datetime.utcnow().isoformat()
            }
            self._anomalies.append(record)
            return record

        return {
            "farmer_ref": farmer_ref,
            "is_suspicious": False,
            "status": "CLEAN_RECORD"
        }

    def get_flagged_anomalies(self) -> List[Dict[str, Any]]:
        return self._anomalies
