from typing import Dict, Any, List, Optional
import uuid

class DataProviderRegistryService:
    """
    Manages Data Providers and Data Consumers registrations, trust levels, and authority tracking.
    """
    def __init__(self):
        self._providers: Dict[str, Dict[str, Any]] = {}
        self._consumers: Dict[str, Dict[str, Any]] = {}
        self._seed_defaults()

    def _seed_defaults(self):
        # Seed default synthetic providers
        self.register_provider({
            "id": "prov-gov-001",
            "provider_id": "GOV_AGRI_DEPT",
            "name": "State Agriculture Department Platform",
            "type": "STATE_GOVERNMENT",
            "jurisdiction": "IN-TN",
            "trust_level": "HIGH",
            "legal_basis": "STATUTORY_MANDATE",
            "consent_requirements": "MANDATORY_NOTATION",
            "status": "ACTIVE",
            "data_domains": ["CROP", "LAND", "POLICY"]
        })
        self.register_provider({
            "id": "prov-res-002",
            "provider_id": "ICAR_RESEARCH_INST",
            "name": "ICAR Central Research Institute",
            "type": "RESEARCH",
            "jurisdiction": "IN",
            "trust_level": "HIGH",
            "legal_basis": "PUBLIC_RESEARCH",
            "consent_requirements": "ANONYMIZED_OPEN",
            "status": "ACTIVE",
            "data_domains": ["SOIL", "PEST", "SEED", "RESEARCH"]
        })
        self.register_provider({
            "id": "prov-fpo-003",
            "provider_id": "GREEN_FIELD_FPO",
            "name": "Green Field Farmers Producer Co",
            "type": "FPO",
            "jurisdiction": "IN-TN-SLM",
            "trust_level": "MEDIUM",
            "legal_basis": "MEMBER_AGREEMENT",
            "consent_requirements": "MEMBER_CONSENT",
            "status": "ACTIVE",
            "data_domains": ["CROP", "HARVEST", "SUPPLY"]
        })

        # Seed default consumers
        self.register_consumer({
            "id": "cons-agrimark-001",
            "consumer_id": "AGRIMARK_CORE",
            "name": "AgriMark Intelligence Platform",
            "organization": "AgriMark Commons",
            "purpose_declarations": ["ADVISORY", "MARKET_ANALYSIS", "CREDIT", "INSURANCE"],
            "retention_days": 365,
            "audit_state": "COMPLIANT"
        })
        self.register_consumer({
            "id": "cons-bank-002",
            "consumer_id": "AGRI_CREDIT_BANK",
            "name": "National Agricultural Credit Bank",
            "organization": "AgriBank",
            "purpose_declarations": ["CREDIT"],
            "retention_days": 180,
            "audit_state": "COMPLIANT"
        })

    def register_provider(self, provider_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = provider_data.get("id") or str(uuid.uuid4())
        provider_data["id"] = p_id
        if "trust_level" not in provider_data:
            provider_data["trust_level"] = "UNVERIFIED"
        self._providers[p_id] = provider_data
        self._providers[provider_data["provider_id"]] = provider_data
        return provider_data

    def register_consumer(self, consumer_data: Dict[str, Any]) -> Dict[str, Any]:
        c_id = consumer_data.get("id") or str(uuid.uuid4())
        consumer_data["id"] = c_id
        self._consumers[c_id] = consumer_data
        self._consumers[consumer_data["consumer_id"]] = consumer_data
        return consumer_data

    def get_provider(self, identifier: str) -> Optional[Dict[str, Any]]:
        return self._providers.get(identifier)

    def get_consumer(self, identifier: str) -> Optional[Dict[str, Any]]:
        return self._consumers.get(identifier)

    def list_providers(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._providers.items() if len(k) == 36 or not k.startswith("prov-")]

    def list_consumers(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._consumers.items() if len(k) == 36 or not k.startswith("cons-")]
