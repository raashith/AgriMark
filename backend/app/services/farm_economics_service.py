from typing import Dict, Any, List, Optional
import uuid

class FarmEconomicsService:
    """
    FarmEconomicsService: Normalizes farmer/farm economics layer.
    Calculates gross revenue, gross cost, net farm income, profit margins, cost per unit,
    realization per unit, and profit metrics across crop cycles, seasons, and financial years.
    """
    def __init__(self):
        self._profiles: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_profile()

    def _seed_sample_profile(self):
        self.calculate_and_save_profile(
            farmer_ref="farmer-001",
            farm_ref="farm-101",
            season="Kharif 2026",
            gross_revenue_inr=125000.00,
            gross_cost_inr=65000.00,
            cost_breakdown={
                "seed": 8000.00,
                "fertilizer": 14000.00,
                "pesticide": 9000.00,
                "labour": 18000.00,
                "irrigation": 6000.00,
                "transport": 5000.00,
                "marketplace_fees": 500.00,
                "financing": 4500.00
            }
        )

    def calculate_and_save_profile(self, farmer_ref: str, farm_ref: str, season: str, gross_revenue_inr: float, gross_cost_inr: float, cost_breakdown: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        p_id = str(uuid.uuid4())
        net_income = round(gross_revenue_inr - gross_cost_inr, 2)
        profit_margin = round((net_income / gross_revenue_inr * 100.0), 2) if gross_revenue_inr > 0 else 0.0

        record = {
            "id": p_id,
            "farmer_ref": farmer_ref,
            "farm_ref": farm_ref,
            "season": season,
            "gross_revenue_inr": gross_revenue_inr,
            "gross_cost_inr": gross_cost_inr,
            "net_farm_income_inr": net_income,
            "profit_margin_pct": profit_margin,
            "cost_breakdown": cost_breakdown or {},
            "derived_metrics": {
                "income_per_acre": round(net_income / 2.5, 2), # Assuming 2.5 acre farm
                "cost_per_acre": round(gross_cost_inr / 2.5, 2),
                "profit_to_cost_ratio": round((net_income / gross_cost_inr), 2) if gross_cost_inr > 0 else 0.0
            }
        }
        self._profiles[farmer_ref] = record
        self._profiles[p_id] = record
        return record

    def get_profile(self, farmer_ref: str) -> Optional[Dict[str, Any]]:
        return self._profiles.get(farmer_ref)
