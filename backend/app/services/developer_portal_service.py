from typing import Dict, Any, List, Optional
import uuid
import hashlib
from datetime import datetime

class DeveloperPortalService:
    """
    Manages Developer Portal onboarding, tenant organization isolation, OAuth/API key generation,
    and developer API quotas without exposing secret keys in logs.
    """
    def __init__(self):
        self._organizations: Dict[str, Dict[str, Any]] = {}
        self._api_keys: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_organizations()

    def _seed_sample_organizations(self):
        self.register_organization({
            "id": "org-startup-001",
            "org_code": "AGRI_TECH_STARTUP_TN",
            "name": "AgriVision AI Solutions",
            "type": "STARTUP",
            "verified_status": "VERIFIED",
            "trust_status": "ACTIVE"
        })
        self.register_organization({
            "id": "org-univ-002",
            "org_code": "TNAU_RESEARCH_LAB",
            "name": "Tamil Nadu Agricultural University Innovation Lab",
            "type": "UNIVERSITY",
            "verified_status": "VERIFIED",
            "trust_status": "ACTIVE"
        })

    def register_organization(self, org_data: Dict[str, Any]) -> Dict[str, Any]:
        o_id = org_data.get("id") or str(uuid.uuid4())
        org_data["id"] = o_id
        if "verified_status" not in org_data:
            org_data["verified_status"] = "UNVERIFIED"
        self._organizations[o_id] = org_data
        self._organizations[org_data["org_code"]] = org_data
        return org_data

    def generate_api_key(self, org_id: str, project_id: str, scopes: List[str]) -> Dict[str, Any]:
        raw_key = f"agrk_sbx_{uuid.uuid4().hex}"
        secret_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

        key_record = {
            "key_id": str(uuid.uuid4()),
            "org_id": org_id,
            "project_id": project_id,
            "raw_key": raw_key, # Returned ONCE to client
            "secret_hash": secret_hash,
            "scopes": scopes,
            "status": "ACTIVE",
            "created_at": datetime.utcnow().isoformat()
        }
        self._api_keys[secret_hash] = key_record
        return key_record

    def validate_api_key(self, raw_key: str) -> Dict[str, Any]:
        secret_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
        key_rec = self._api_keys.get(secret_hash)
        if not key_rec or key_rec["status"] != "ACTIVE":
            return {"valid": False, "reason": "Invalid or revoked API key"}
        return {"valid": True, "org_id": key_rec["org_id"], "project_id": key_rec["project_id"], "scopes": key_rec["scopes"]}

    def get_organization(self, identifier: str) -> Optional[Dict[str, Any]]:
        return self._organizations.get(identifier)

    def list_organizations(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._organizations.items() if len(k) == 36 or not k.startswith("org-")]
