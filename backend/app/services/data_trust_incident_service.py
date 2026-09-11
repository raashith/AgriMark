from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class DataTrustIncidentService:
    """
    Computes DataTrustScore for datasets and handles Data Incident Lifecycle:
    DETECT -> CONTAIN -> ASSESS -> REMEDIATE -> VERIFY -> CLOSE
    Incident Types: POISONING, LEAK, CORRUPTION, SCHEMA_BREAK, QUALITY_FAILURE, CONSENT_FAILURE
    """
    def __init__(self):
        self._incidents: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_incident()

    def _seed_sample_incident(self):
        self.report_incident({
            "incident_type": "QUALITY_FAILURE",
            "severity": "MEDIUM",
            "affected_product_id": "prod-weather-001",
            "description": "Temperature readings contained negative extreme values due to sensor drift."
        })

    def calculate_data_trust_score(self, provenance_score: float, quality_score: float, freshness_score: float, authority_score: float) -> Dict[str, Any]:
        weighted_score = round(
            (provenance_score * 0.30) +
            (quality_score * 0.30) +
            (freshness_score * 0.20) +
            (authority_score * 0.20),
            2
        )

        if weighted_score >= 85.0:
            tier = "HIGH"
        elif weighted_score >= 70.0:
            tier = "MEDIUM"
        elif weighted_score >= 50.0:
            tier = "LOW"
        else:
            tier = "UNVERIFIED"

        return {
            "overall_trust_score": weighted_score,
            "trust_tier": tier,
            "breakdown": {
                "provenance": provenance_score,
                "quality": quality_score,
                "freshness": freshness_score,
                "authority": authority_score
            }
        }

    def report_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        i_id = str(uuid.uuid4())
        inc_code = incident_data.get("incident_code") or f"INC-{i_id[:8].upper()}"

        record = {
            "id": i_id,
            "incident_code": inc_code,
            "incident_type": incident_data.get("incident_type", "CORRUPTION"),
            "severity": incident_data.get("severity", "HIGH"),
            "affected_product_id": incident_data.get("affected_product_id"),
            "status": "DETECTED",
            "description": incident_data.get("description", "No description provided"),
            "remediation_notes": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        self._incidents[i_id] = record
        self._incidents[inc_code] = record
        return record

    def update_incident_status(self, incident_identifier: str, next_status: str, remediation_notes: Optional[str] = None) -> Dict[str, Any]:
        inc = self._incidents.get(incident_identifier)
        if not inc:
            raise ValueError(f"Incident '{incident_identifier}' not found")

        valid_statuses = ["DETECTED", "CONTAINED", "ASSESSED", "REMEDIATED", "VERIFIED", "CLOSED"]
        if next_status not in valid_statuses:
            raise ValueError(f"Invalid status '{next_status}'. Allowed: {valid_statuses}")

        inc["status"] = next_status
        if remediation_notes:
            inc["remediation_notes"] = remediation_notes
        inc["updated_at"] = datetime.utcnow().isoformat()
        return inc

    def list_incidents(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._incidents.items() if len(k) == 36]
