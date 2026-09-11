from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timedelta

class ConsentPurposePolicyService:
    """
    ConsentManager & Purpose Policy Engine: Validates purpose permissions, scope limits,
    consent grants/withdrawals, and enforces strict data minimization.
    """
    ALLOWED_PURPOSES = [
        "ADVISORY", "MARKET_ANALYSIS", "CREDIT", "INSURANCE", "RESEARCH",
        "POLICY_ANALYSIS", "FOOD_SECURITY", "LOGISTICS", "MODEL_TRAINING", "MODEL_EVALUATION"
    ]

    FIELD_MINIMIZATION_RULES: Dict[str, List[str]] = {
        "WEATHER": ["temperature", "humidity", "rainfall", "wind_speed", "district", "state"],
        "MARKET_PRICES": ["commodity", "variety", "price_per_kg", "market", "district", "state", "price_date"],
        "ADVISORY": ["crop_name", "quantity", "soil_type", "irrigation_type", "district", "state"],
        "CREDIT": ["farm_size_acres", "crop_category", "historical_yield", "district", "repayment_status"],
        "INSURANCE": ["farm_size_acres", "crop_name", "sowing_date", "district", "loss_event"]
    }


    def __init__(self):
        self._consents: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_consents()

    def _seed_sample_consents(self):
        self.grant_consent(
            farmer_ref="farmer-001",
            consumer_id="cons-agrimark-001",
            data_scope=["CROP", "FARM", "WEATHER"],
            purpose="ADVISORY",
            duration_days=365
        )
        self.grant_consent(
            farmer_ref="farmer-001",
            consumer_id="cons-bank-002",
            data_scope=["CREDIT", "YIELD"],
            purpose="CREDIT",
            duration_days=180
        )

    def grant_consent(self, farmer_ref: str, consumer_id: str, data_scope: List[str], purpose: str, duration_days: int = 365) -> Dict[str, Any]:
        if purpose not in self.ALLOWED_PURPOSES:
            raise ValueError(f"Invalid purpose '{purpose}'. Allowed: {self.ALLOWED_PURPOSES}")

        consent_id = str(uuid.uuid4())
        now = datetime.utcnow()
        expiry = now + timedelta(days=duration_days)

        consent_record = {
            "id": consent_id,
            "farmer_ref": farmer_ref,
            "consumer_id": consumer_id,
            "data_scope": data_scope,
            "purpose": purpose,
            "duration_days": duration_days,
            "status": "GRANTED",
            "granted_at": now.isoformat(),
            "withdrawn_at": None,
            "expires_at": expiry.isoformat()
        }
        self._consents[consent_id] = consent_record
        self._consents[f"{farmer_ref}:{consumer_id}:{purpose}"] = consent_record
        return consent_record

    def withdraw_consent(self, farmer_ref: str, consumer_id: str, purpose: str) -> Dict[str, Any]:
        key = f"{farmer_ref}:{consumer_id}:{purpose}"
        consent = self._consents.get(key)
        if not consent:
            raise ValueError("No active consent found to withdraw")

        consent["status"] = "WITHDRAWN"
        consent["withdrawn_at"] = datetime.utcnow().isoformat()
        return consent

    def validate_access_permission(self, farmer_ref: Optional[str], consumer_id: str, requested_purpose: str, data_domain: str) -> Dict[str, Any]:
        # Purpose check
        if requested_purpose not in self.ALLOWED_PURPOSES:
            return {
                "permitted": False,
                "reason": f"Declared purpose '{requested_purpose}' is not recognized or allowed."
            }

        # Consent check if farmer data is involved
        if farmer_ref:
            key = f"{farmer_ref}:{consumer_id}:{requested_purpose}"
            consent = self._consents.get(key)
            if not consent or consent["status"] != "GRANTED":
                return {
                    "permitted": False,
                    "reason": f"Active consent not granted by farmer {farmer_ref} to consumer {consumer_id} for purpose {requested_purpose}."
                }

            # Scope check
            if data_domain not in consent["data_scope"]:
                return {
                    "permitted": False,
                    "reason": f"Data domain '{data_domain}' is outside the granted consent scope {consent['data_scope']}."
                }

        return {
            "permitted": True,
            "reason": "Access granted under valid consent & declared purpose policy."
        }

    def minimize_fields(self, payload: Dict[str, Any], purpose: str) -> Dict[str, Any]:
        allowed = self.FIELD_MINIMIZATION_RULES.get(purpose)
        if not allowed:
            # Strip explicit PII fields if no specific rule
            pii_fields = ["phone", "email", "bank_account", "aadhaar", "full_name"]
            return {k: v for k, v in payload.items() if k not in pii_fields}

        return {k: v for k, v in payload.items() if k in allowed}
