import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class LogisticsProcessingService:
    """
    Stage 27 Logistics, Cold Chain, Processing Capacity & Perishability Service.
    Enforces no autonomous physical execution without Stage 21 authorization.
    """

    def __init__(self):
        self._facilities: Dict[str, Dict[str, Any]] = {}
        self._reefers: Dict[str, Dict[str, Any]] = {}

        self._seed_default_infrastructure()

    def _seed_default_infrastructure(self):
        f1 = {
            "id": str(uuid.uuid4()),
            "facility_code": "FAC-COLD-THANJAVUR",
            "facility_name": "Cauvery Delta Agri Cold Storage & Packhouse",
            "facility_type": "COLD_STORAGE",
            "district": "Thanjavur",
            "state": "Tamil Nadu",
            "total_capacity_mt": 5000.0,
            "available_capacity_mt": 1850.0,
            "cold_chain_capable": True,
            "temperature_celsius": 4.0,
            "created_at": datetime.utcnow().isoformat()
        }
        self._facilities[f1["facility_code"]] = f1

    def list_facilities(self, facility_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if facility_type:
            return [f for f in self._facilities.values() if f["facility_type"].lower() == facility_type.lower()]
        return list(self._facilities.values())

    def analyze_storage_vs_sell(self, crop_name: str, quantity_kg: float, current_price: float, storage_cost_per_kg: float = 0.50, expected_appreciation_pct: float = 8.5, perishability_days: int = 45) -> Dict[str, Any]:
        """
        Calculates Net Realization of Selling Immediately vs Storing for 30 days.
        """
        immediate_revenue = quantity_kg * current_price

        expected_price_30d = current_price * (1.0 + (expected_appreciation_pct / 100.0))
        future_gross_revenue = quantity_kg * expected_price_30d
        total_storage_cost = quantity_kg * storage_cost_per_kg

        # Perishability loss risk (e.g. 2% storage loss)
        loss_pct = 2.0 if perishability_days > 30 else 8.0
        realized_quantity = quantity_kg * (1.0 - (loss_pct / 100.0))
        future_net_revenue = (realized_quantity * expected_price_30d) - total_storage_cost

        recommendation = "STORE_30_DAYS" if future_net_revenue > immediate_revenue else "SELL_IMMEDIATELY"
        net_gain_inr = round(future_net_revenue - immediate_revenue, 2)

        return {
            "crop_name": crop_name,
            "quantity_kg": quantity_kg,
            "current_immediate_revenue_inr": round(immediate_revenue, 2),
            "expected_price_30d_inr_per_kg": round(expected_price_30d, 2),
            "total_storage_cost_inr": round(total_storage_cost, 2),
            "estimated_spoilage_loss_pct": loss_pct,
            "future_net_revenue_inr": round(future_net_revenue, 2),
            "recommendation": recommendation,
            "net_gain_from_storing_inr": net_gain_inr,
            "evidence_status": "ESTIMATED",
            "physical_execution_authorized": False # Stage 21 safety check
        }

    def optimize_route_and_booking(self, origin: str, destination: str, produce_type: str, quantity_mt: float) -> Dict[str, Any]:
        return {
            "booking_code": f"LOGI-{uuid.uuid4().hex[:8].upper()}",
            "origin": origin,
            "destination": destination,
            "produce_type": produce_type,
            "quantity_mt": quantity_mt,
            "recommended_multimodal_mode": "ROAD_REEFER_EXPRESS",
            "transit_time_hours": 14,
            "cold_chain_telemetry_status": "ACTIVE_MONITORING",
            "estimated_transport_cost_inr": round(quantity_mt * 1850.0, 2),
            "post_harvest_loss_reduction_pct": 35.0,
            "booking_status": "PROVISIONAL_QUOTE_READY",
            "autonomous_physical_execution": False
        }
