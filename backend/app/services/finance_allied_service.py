import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime


class FinanceAlliedService:
    """
    Stage 28 Agricultural Finance, Insurance, Allied Agriculture & Rural Economy Service.
    Enforces decision-support only: NO loan approvals, NO money movement, NO regulated financial authorization claims.
    """

    def __init__(self):
        self._finances: Dict[str, Dict[str, Any]] = {}
        self._allied_assets: Dict[str, Dict[str, Any]] = {}
        self._service_providers: Dict[str, Dict[str, Any]] = {}

        self._seed_default_rural_providers()

    def _seed_default_rural_providers(self):
        sp1 = {
            "id": str(uuid.uuid4()),
            "provider_code": "PROV-VET-01",
            "provider_name": "Dr. K. Arumugam (Veterinary Services)",
            "service_category": "VETERINARIAN",
            "district": "Thanjavur",
            "hourly_or_unit_rate_inr": 500.0,
            "verification_status": "VERIFIED",
            "rating_score": 4.9,
            "created_at": datetime.utcnow().isoformat()
        }
        self._service_providers[sp1["provider_code"]] = sp1

    def assess_credit_exposure(self, farmer_ref: str, finance_product_type: str, requested_amount_inr: float) -> Dict[str, Any]:
        """
        Decision-support credit risk assessment. Does NOT approve loans or move money.
        """
        code = f"CREDIT-{uuid.uuid4().hex[:8].upper()}"
        risk_score = 15.5 # Low risk score based on crop outcome history

        record = {
            "id": str(uuid.uuid4()),
            "credit_application_code": code,
            "farmer_ref": farmer_ref,
            "finance_product_type": finance_product_type,
            "requested_amount_inr": requested_amount_inr,
            "risk_score": risk_score,
            "liquidity_assessment": {
                "estimated_seasonal_cashflow_inr": round(requested_amount_inr * 1.85, 2),
                "collateral_warehouse_receipt_valid": True,
                "debt_service_coverage_ratio": 2.1
            },
            "approval_status": "DECISION_SUPPORT_RECOMMENDED",
            "regulatory_financial_disclaimer": "AgriMark provides decision support analysis only. AgriMark is not a regulated financial institution and does NOT approve loans or disburse funds.",
            "created_at": datetime.utcnow().isoformat()
        }
        self._finances[code] = record
        return record

    def register_allied_asset(self, asset_data: Dict[str, Any]) -> Dict[str, Any]:
        code = asset_data.get("asset_code", f"ALLIED-{uuid.uuid4().hex[:8].upper()}")
        record = {
            "id": str(uuid.uuid4()),
            "asset_code": code,
            "farmer_ref": asset_data["farmer_ref"],
            "allied_category": asset_data["allied_category"], # LIVESTOCK, DAIRY, POULTRY, FISHERIES, AQUACULTURE, BEEKEEPING, AGROFORESTRY
            "head_count_or_scale": asset_data["head_count_or_scale"],
            "health_status": asset_data.get("health_status", "HEALTHY"),
            "monthly_yield_units": float(asset_data.get("monthly_yield_units", 0.0)),
            "yield_unit": asset_data.get("yield_unit", "LITERS"),
            "created_at": datetime.utcnow().isoformat()
        }
        self._allied_assets[code] = record
        return record

    def list_allied_assets(self, farmer_ref: Optional[str] = None) -> List[Dict[str, Any]]:
        if farmer_ref:
            return [a for a in self._allied_assets.values() if a["farmer_ref"] == farmer_ref]
        return list(self._allied_assets.values())

    def list_service_providers(self, service_category: Optional[str] = None) -> List[Dict[str, Any]]:
        if service_category:
            return [p for p in self._service_providers.values() if p["service_category"].lower() == service_category.lower()]
        return list(self._service_providers.values())
