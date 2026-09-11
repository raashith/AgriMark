import pytest
from backend.app.services.developer_portal_service import DeveloperPortalService
from backend.app.services.sandbox_project_service import SandboxProjectService
from backend.app.services.synthetic_data_generator import SyntheticDataGenerator
from backend.app.services.model_api_marketplace_service import ModelApiMarketplaceService
from backend.app.services.experiment_benchmark_service import ExperimentBenchmarkService
from backend.app.services.compute_simulation_sandbox_service import ComputeSimulationSandboxService
from backend.app.services.living_labs_challenge_service import LivingLabsChallengeService
from backend.app.services.promotion_gate_trust_service import PromotionGateTrustService
from backend.app.agents.innovation_agents import DeveloperAssistantAgent, BenchmarkAgent, ValidationAgent


def test_developer_portal_and_organization_tenant_isolation():
    service = DeveloperPortalService()
    orgs = service.list_organizations()
    assert len(orgs) >= 2

    # Generate API key
    key_info = service.generate_api_key("org-startup-001", "proj-sbx-001", ["SANDBOX_READ"])
    assert key_info["raw_key"].startswith("agrk_sbx_")
    assert key_info["secret_hash"] is not None

    # Validate Key
    val = service.validate_api_key(key_info["raw_key"])
    assert val["valid"] is True
    assert val["org_id"] == "org-startup-001"


def test_sandbox_project_isolation_and_production_boundary():
    service = SandboxProjectService()
    proj = service.create_project({"project_code": "PRJ_TEST_01", "title": "Test Sandbox", "org_id": "org-startup-001", "owner_id": "dev-01", "purpose": "Testing"})
    assert proj["environment"] == "SANDBOX"

    # Test production mutation blocking in SANDBOX environment
    block = service.validate_action_environment_boundary(proj["id"], "PLACE_PRODUCTION_ORDER")
    assert block["permitted"] is False
    assert block["isolation_status"] == "BLOCKED"
    assert "cannot mutate production operational state" in block["reason"]

    # Test allowed read action
    allow = service.validate_action_environment_boundary(proj["id"], "READ_DATA")
    assert allow["permitted"] is True


def test_synthetic_data_generator_tagging():
    gen = SyntheticDataGenerator()
    ds = gen.generate_synthetic_dataset("PRICES", count=5, crop_name="TOMATO", district="Salem")
    assert ds["domain"] == "PRICES"
    assert len(ds["records"]) == 5
    assert ds["records"][0]["synthetic"] is True
    assert ds["provenance"]["synthetic_flag"] is True


def test_model_and_api_marketplace():
    service = ModelApiMarketplaceService()
    models = service.list_models()
    apis = service.list_apis()
    assert len(models) >= 2
    assert len(apis) >= 2
    assert models[0]["safety_status"] == "CERTIFIED_SAFE"


def test_experiment_workspace_and_tamil_multilingual_benchmark():
    service = ExperimentBenchmarkService()

    # Record experiment
    exp = service.record_experiment({"project_id": "proj-sbx-001", "title": "Pest Vision Model Run", "metrics": {"accuracy": 0.96}})
    assert exp["reproducibility_status"] == "VERIFIED"

    # Evaluate Tamil QA Benchmark
    run = service.run_benchmark_evaluation("BM_TAMIL_FARMER_QA_V1", "MOD_PEST_VISION_V2", language="ta")
    assert run["metrics"]["factual_correctness"] == 96.5
    assert run["metrics"]["agricultural_terminology_accuracy"] == 98.2
    assert run["metrics"]["evaluated_language"] == "ta (Tamil)"


def test_compute_abstraction_and_simulations():
    service = ComputeSimulationSandboxService()

    # Compute submission
    job = service.submit_compute_job("proj-sbx-001", "TRAIN_MODEL", "LOCAL_CPU")
    assert job["status"] == "RUNNING"

    # Drone simulation
    drone = service.simulate_drone_mission("CROP_HEALTH_SCAN", 5.0)
    assert drone["is_physical_execution"] is False
    assert drone["geofence_status"] == "COMPLIANT_IN_BOUNDS"

    # Digital Twin simulation
    twin = service.run_digital_twin_sandbox_scenario("CLIMATE_HEATWAVE", "Salem")
    assert twin["state_isolation"] == "REAL_DATABASE_UNMUTATED"


def test_living_labs_challenges_and_mentors():
    service = LivingLabsChallengeService()
    labs = service.list_living_labs()
    chals = service.list_challenges()
    funding = service.list_funding()
    assert len(labs) >= 1
    assert len(chals) >= 1
    assert len(funding) >= 1

    # Match mentor
    match = service.match_mentor_to_project("proj-sbx-001", "Agronomy")
    assert match["status"] == "MATCHED"


def test_production_promotion_gate_and_human_approval():
    service = PromotionGateTrustService()

    # Submit promotion request
    prom = service.submit_promotion_request("proj-sbx-001", "PRODUCTION", "High accuracy validated in field pilot", ["http://evidence.link/1"])
    assert prom["status"] == "SUBMITTED"
    assert prom["validation_checklist"]["human_approval"] == "PENDING"

    # Review & Approve requiring explicit human approver_id
    approved = service.review_and_approve_promotion(prom["id"], "admin-human-404", "APPROVED", "Passed all 10-step checks")
    assert approved["status"] == "APPROVED"
    assert approved["human_approver_id"] == "admin-human-404"
    assert approved["validation_checklist"]["human_approval"] == "APPROVED_BY_admin-human-404"

    # Test rejection if missing approver_id
    with pytest.raises(ValueError, match="Human approval requires an explicit approver_id"):
        service.review_and_approve_promotion(prom["id"], "", "APPROVED", "No approver")


def test_specialist_innovation_ai_agents():
    dev_agent = DeveloperAssistantAgent()
    res_d = dev_agent.run("Design experiment for tomato yield model")
    assert res_d["assistance_type"] == "EXPERIMENT_DESIGN"

    val_agent = ValidationAgent()
    res_v = val_agent.run("Validate promotion")
    assert res_v["can_auto_promote"] is False # Safety rule check
