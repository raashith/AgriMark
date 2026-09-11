from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.app.services.experiment_benchmark_service import ExperimentBenchmarkService
from backend.app.services.compute_simulation_sandbox_service import ComputeSimulationSandboxService
from backend.app.schemas.innovation_sandbox import BenchmarkRunRequest

router = APIRouter(prefix="/experiments", tags=["Experiment Workspace & Benchmarks"])

exp_bm_service = ExperimentBenchmarkService()
compute_sim_service = ComputeSimulationSandboxService()

@router.post("/record")
def record_experiment(req: Dict[str, Any]):
    return exp_bm_service.record_experiment(req)

@router.post("/benchmarks/evaluate")
def evaluate_benchmark(req: BenchmarkRunRequest):
    return exp_bm_service.run_benchmark_evaluation(
        benchmark_code=req.benchmark_code,
        model_code=req.model_code,
        language=req.language or "ta"
    )

@router.get("/benchmarks/leaderboard")
def get_leaderboard(category: str = "TAMIL_LANGUAGE", tier: str = "RESEARCH"):
    return exp_bm_service.get_leaderboard(category, tier)

@router.post("/simulations/drone")
def simulate_drone(req: Dict[str, Any]):
    return compute_sim_service.simulate_drone_mission(
        mission_type=req.get("mission_type", "CROP_HEALTH_SCAN"),
        field_area_acres=req.get("field_area_acres", 5.0)
    )

@router.post("/simulations/twin")
def run_twin_sandbox(req: Dict[str, Any]):
    return compute_sim_service.run_digital_twin_sandbox_scenario(
        scenario_type=req.get("scenario_type", "CLIMATE_HEATWAVE"),
        district=req.get("district", "Salem")
    )
