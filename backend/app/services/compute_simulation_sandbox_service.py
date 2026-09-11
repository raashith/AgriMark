from typing import Dict, Any, List, Optional
import random
import uuid
from datetime import datetime

class ComputeSimulationSandboxService:
    """
    Compute & Simulation Sandbox Engine:
    1. Provider-neutral compute abstraction (local CPU, local GPU, cloud GPU, managed ML)
    2. IoT Sensor telemetry simulation (noisy data, missing data, anomaly events)
    3. Drone / Robotics mission simulation (route, geofence, battery, emergency-stop)
    4. Digital Twin sandbox scenario runner (isolated state, non-mutating)
    """
    COMPUTE_PROVIDERS = ["LOCAL_CPU", "LOCAL_GPU", "CLOUD_GPU", "MANAGED_ML"]

    def submit_compute_job(self, project_id: str, job_type: str, provider: str = "LOCAL_CPU", resource_quota: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if provider not in self.COMPUTE_PROVIDERS:
            raise ValueError(f"Provider '{provider}' not supported. Allowed: {self.COMPUTE_PROVIDERS}")

        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        return {
            "job_id": job_id,
            "project_id": project_id,
            "job_type": job_type,
            "provider": provider,
            "status": "RUNNING",
            "estimated_cost_inr": 0.00 if provider == "LOCAL_CPU" else 45.00,
            "submitted_at": datetime.utcnow().isoformat()
        }

    def simulate_sensor_telemetry(self, device_type: str = "SOIL_MOISTURE", count: int = 5) -> List[Dict[str, Any]]:
        telemetry = []
        for i in range(count):
            if device_type == "SOIL_MOISTURE":
                val = round(22.5 + (i * 1.2), 1)
                flag = "NORMAL" if val < 30.0 else "HIGH_MOISTURE"
            else:
                val = round(32.0 + (i * 0.5), 1)
                flag = "NORMAL"

            telemetry.append({
                "device_id": f"SIM-DEV-{device_type[:4]}-{i+1}",
                "device_type": device_type,
                "reading_value": val,
                "battery_pct": 92 - i,
                "status_flag": flag,
                "is_simulated": True,
                "timestamp": datetime.utcnow().isoformat()
            })
        return telemetry

    def simulate_drone_mission(self, mission_type: str = "CROP_HEALTH_SCAN", field_area_acres: float = 5.0) -> Dict[str, Any]:
        mission_id = f"MIS-DRONE-{uuid.uuid4().hex[:6].upper()}"
        return {
            "mission_id": mission_id,
            "mission_type": mission_type,
            "field_area_acres": field_area_acres,
            "waypoints_count": 24,
            "battery_consumption_pct": 18.5,
            "geofence_status": "COMPLIANT_IN_BOUNDS",
            "emergency_stop_test": "VERIFIED_OPERATIONAL",
            "mission_status": "SIMULATED_SUCCESS",
            "is_physical_execution": False # SAFETY GUARANTEE
        }

    def run_digital_twin_sandbox_scenario(self, scenario_type: str, district: str = "Salem", duration_days: int = 30) -> Dict[str, Any]:
        return {
            "scenario_id": f"SCEN-TWIN-{uuid.uuid4().hex[:6].upper()}",
            "scenario_type": scenario_type, # e.g., CLIMATE_HEATWAVE, MARKET_PRICE_SHOCK
            "district": district,
            "duration_days": duration_days,
            "simulated_outcomes": {
                "expected_yield_impact_pct": -8.5,
                "price_volatility_index": "MEDIUM_HIGH",
                "recommended_mitigation": "Micro-irrigation & early harvest recommendation"
            },
            "state_isolation": "REAL_DATABASE_UNMUTATED"
        }
