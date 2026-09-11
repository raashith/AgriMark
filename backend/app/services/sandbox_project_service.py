from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

class SandboxProjectService:
    """
    Manages isolated Sandbox Projects with strict environment boundaries:
    SANDBOX -> VALIDATION -> STAGING -> PILOT -> PRODUCTION
    Default environment is SANDBOX_ONLY. Direct production mutation is strictly blocked.
    """
    ALLOWED_ENVIRONMENTS = ["SANDBOX", "VALIDATION", "STAGING", "PILOT", "PRODUCTION"]

    def __init__(self):
        self._projects: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_project()

    def _seed_sample_project(self):
        self.create_project({
            "id": "proj-sbx-001",
            "project_code": "PRJ_TOMATO_YIELD_AI",
            "title": "Precision Tomato Yield Forecasting Sandbox",
            "org_id": "org-startup-001",
            "owner_id": "dev-user-100",
            "purpose": "AI Yield Prediction Model Testing",
            "crop_domains": ["TOMATO", "CROP"],
            "geography": "Tamil Nadu"
        })

    def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        p_id = project_data.get("id") or str(uuid.uuid4())
        p_code = project_data.get("project_code") or f"PRJ-{p_id[:8].upper()}"

        record = {
            "id": p_id,
            "project_code": p_code,
            "title": project_data.get("title", "Untitled Project"),
            "org_id": project_data.get("org_id"),
            "owner_id": project_data.get("owner_id"),
            "environment": "SANDBOX", # DEFAULT STRICT ENFORCEMENT
            "purpose": project_data.get("purpose", "Experimentation"),
            "crop_domains": project_data.get("crop_domains", ["CROP"]),
            "geography": project_data.get("geography", "Tamil Nadu"),
            "status": "ACTIVE",
            "quotas": {"api_calls_per_day": 10000, "compute_hours": 50, "storage_gb": 20},
            "created_at": datetime.utcnow().isoformat()
        }
        self._projects[p_id] = record
        self._projects[p_code] = record
        return record

    def get_project(self, identifier: str) -> Optional[Dict[str, Any]]:
        return self._projects.get(identifier)

    def validate_action_environment_boundary(self, project_identifier: str, attempted_action: str) -> Dict[str, Any]:
        """
        Validates if an action is permitted within the project's current environment.
        Blocks production financial/inventory mutations from SANDBOX or VALIDATION environments.
        """
        project = self.get_project(project_identifier)
        if not project:
            return {"permitted": False, "reason": "Project not found"}

        env = project["environment"]
        mutation_actions = ["PLACE_PRODUCTION_ORDER", "TRANSFER_MONEY", "MODIFY_INVENTORY", "CHANGE_PRICES", "EXECUTE_PHYSICAL_ACT"]

        if env in ["SANDBOX", "VALIDATION"] and attempted_action in mutation_actions:
            return {
                "permitted": False,
                "reason": f"Action '{attempted_action}' is blocked in environment '{env}'. Sandbox projects cannot mutate production operational state.",
                "isolation_status": "BLOCKED"
            }

        return {
            "permitted": True,
            "reason": f"Action permitted in environment '{env}'.",
            "isolation_status": "ALLOW"
        }

    def list_projects(self) -> List[Dict[str, Any]]:
        return [v for k, v in self._projects.items() if len(k) == 36]
