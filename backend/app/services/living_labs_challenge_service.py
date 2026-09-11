from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class LivingLabsChallengeService:
    """
    Living Labs & Challenge System:
    1. Living Labs field pilot sites & farmer cohort management
    2. Innovation Challenges & Submissions
    3. Mentor & Agronomist Network matching
    4. Funding / Grants Registry (Provider-neutral abstraction)
    5. IP / Licensing & Attribution framework
    """
    def __init__(self):
        self._living_labs: Dict[str, Dict[str, Any]] = {}
        self._challenges: Dict[str, Dict[str, Any]] = {}
        self._mentors: Dict[str, Dict[str, Any]] = {}
        self._funding: List[Dict[str, Any]] = []
        self._seed_defaults()

    def _seed_defaults(self):
        self.create_living_lab({
            "id": "lab-001",
            "lab_code": "LAB_SALEM_SLM_01",
            "name": "Salem Precision Horticulture Living Lab",
            "district": "Salem",
            "state": "Tamil Nadu",
            "partner_fpo": "Green Field Farmers Producer Co",
            "cohort_farmer_count": 75
        })
        self.create_challenge({
            "id": "chal-001",
            "challenge_code": "CHAL_TN_PEST_AI_2026",
            "title": "Tamil Nadu Early Pest Detection AI Challenge",
            "problem_statement": "Develop low-cost smartphone image pest detection for tomato and paddy crops.",
            "crop_scope": "TOMATO, PADDY",
            "sponsor": "Tamil Nadu Agri-Tech Innovation Mission",
            "stage": "OPEN",
            "prize_pool_inr": 500000.00
        })
        self.register_mentor({
            "id": "mnt-001",
            "name": "Dr. K. Swaminathan",
            "expertise": "Agronomy & Plant Pathology",
            "organization": "TNAU Coimbatore",
            "availability": "AVAILABLE"
        })
        self._funding.append({
            "funding_id": "fnd-001",
            "title": "National AgriTech Startup Seed Grant",
            "provider": "NABARD Innovation Fund",
            "max_amount_inr": 2500000.00,
            "category": "GRANT",
            "deadline": "2026-12-31"
        })

    def create_living_lab(self, lab_data: Dict[str, Any]) -> Dict[str, Any]:
        l_id = lab_data.get("id") or str(uuid.uuid4())
        lab_data["id"] = l_id
        self._living_labs[l_id] = lab_data
        self._living_labs[lab_data["lab_code"]] = lab_data
        return lab_data

    def create_challenge(self, chal_data: Dict[str, Any]) -> Dict[str, Any]:
        c_id = chal_data.get("id") or str(uuid.uuid4())
        chal_data["id"] = c_id
        self._challenges[c_id] = chal_data
        self._challenges[chal_data["challenge_code"]] = chal_data
        return chal_data

    def register_mentor(self, mentor_data: Dict[str, Any]) -> Dict[str, Any]:
        m_id = mentor_data.get("id") or str(uuid.uuid4())
        mentor_data["id"] = m_id
        self._mentors[m_id] = mentor_data
        return mentor_data

    def match_mentor_to_project(self, project_id: str, domain: str) -> Dict[str, Any]:
        mentors = list(self._mentors.values())
        selected = mentors[0] if mentors else {"name": "Senior Agronomist", "expertise": domain}
        return {
            "project_id": project_id,
            "assigned_mentor": selected,
            "status": "MATCHED",
            "session_schedule": "Bi-weekly advisory"
        }

    def register_ip_record(self, project_id: str, asset_name: str, owner_org: str, license_type: str) -> Dict[str, Any]:
        return {
            "ip_record_id": f"IP-{uuid.uuid4().hex[:6].upper()}",
            "project_id": project_id,
            "asset_name": asset_name,
            "owner_org": owner_org,
            "license_type": license_type, # e.g. MIT, APACHE2, PROPRIETARY_SANDBOX
            "attribution_required": True,
            "registered_at": datetime.utcnow().isoformat()
        }

    def list_living_labs(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._living_labs.items() if v.get("id") == k]

    def list_challenges(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._challenges.items() if v.get("id") == k]


    def list_funding(self) -> List[Dict[str, Any]]:
        return self._funding
