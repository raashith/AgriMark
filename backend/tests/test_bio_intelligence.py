import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.seed_registry_service import SeedRegistryService
from backend.app.services.germplasm_trait_service import GermplasmTraitService
from backend.app.services.gxe_breeding_service import GxEBreedingService
from backend.app.services.precision_phenotyping_service import PrecisionPhenotypingService
from backend.app.services.bio_input_efficacy_service import BioInputEfficacyService
from backend.app.services.seed_authenticity_counterfeit_service import SeedAuthenticityCounterfeitService
from backend.app.services.climate_seed_recommender_service import ClimateSeedRecommenderService
from backend.app.services.bio_research_evidence_service import BioResearchEvidenceService
from backend.app.agents.bio_agents import (
    SeedIntelligenceAgent, VarietyRecommendationAgent, BreedingResearchAgent,
    BioInputEvidenceAgent, PlantHealthResearchAgent, BioResearchAgent
)

client = TestClient(app)


def test_seed_registry_service():
    service = SeedRegistryService()
    varieties = service.list_varieties()
    assert len(varieties) >= 2
    profile = service.get_variety_profile("VAR-PADDY-CR1009")
    assert profile is not None
    assert "NEVER guaranteed" in profile["expected_yield_disclaimer"]
    assert profile["guaranteed_yield"] is False


def test_trait_ontology_tamil_aliases():
    service = GermplasmTraitService()
    traits = service.list_traits()
    assert len(traits) >= 5
    search = service.search_trait_by_alias("மகசூல்")
    assert len(search) >= 1
    assert search[0]["trait_code"] == "TRAIT-YIELD-POTENTIAL"


def test_gxe_and_breeding_safety():
    service = GxEBreedingService()

    # Rule 6: Restricted genomic record check for unprivileged user
    genotype = service.add_genotype_record(
        {"sample_code": "SAMPLE-001", "marker_data_type": "AUTHORIZED_GENOMIC", "genotype_metadata": {"full_seq": "ATCG"}},
        user_role="farmer"
    )
    assert genotype["access_governance_tier"] == "RESTRICTED"
    assert "privacy_note" in genotype["genotype_metadata"]

    # Rule 7: Genetic research does not trigger physical execution
    gxe = service.run_gxe_analysis("VAR-PADDY-CR1009", "ENV-DELTA-01", "Kharif", "Alluvial", "NORMAL")
    assert gxe["deterministic_guarantee"] is False
    assert gxe["evidence_level"] == "TRIAL"

    trial = service.create_breeding_trial({"program_code": "PROG-01", "location": "Aduthurai"})
    assert trial["autonomous_physical_execution"] is False


def test_phenotyping_confidence():
    service = PrecisionPhenotypingService()
    pheno = service.analyze_multimodal_phenotype({"sample_code": "SAMP-01", "source_modality": "DRONE_IMAGERY", "ndvi": 0.82})
    assert pheno["confidence"] > 0.80
    assert pheno["plant_health"] == "OPTIMAL_HEALTH"


def test_bio_input_and_seed_authenticity():
    seed_service = SeedRegistryService()
    authenticity_service = SeedAuthenticityCounterfeitService(seed_service)

    # Rule 3: Risk flag output, not confirmed counterfeit
    auth_result = authenticity_service.verify_seed_qr("UNKNOWN-BATCH-999")
    assert auth_result["risk_status"] == "RISK_FLAG"
    assert auth_result["is_authentic"] is False
    assert auth_result["certification_status"] == "UNCERTIFIED"


def test_evidence_and_simulation_isolation():
    evidence_service = BioResearchEvidenceService()

    # Rule 1: SIMULATED cannot become OBSERVED
    sim = evidence_service.run_stage20_variety_simulation("VAR-PADDY-CR1009", "VAR-COTTON-DCH32")
    assert sim["evidence_status"] == "SIMULATED"
    assert "SIMULATION ONLY" in sim["disclaimer"]

    # Rule 2: Research result cannot become commercial certification
    res_rec = evidence_service.add_research_record({"title": "Submergence Study", "findings": "SUB1A effect"})
    assert res_rec["evidence_level"] == "RESEARCH"

    # Trust card check
    trust_card = evidence_service.get_trust_card("VAR-PADDY-CR1009")
    assert "model_card" in trust_card
    assert "dataset_card" in trust_card


def test_bio_agents_safety():
    rec_agent = VarietyRecommendationAgent()
    res_rec = rec_agent.run("Recommend Paddy variety")
    assert res_rec["guaranteed_yield"] is False

    breed_agent = BreedingResearchAgent()
    res_breed = breed_agent.run("Analyze breeding cross")
    assert res_breed["autonomous_wet_lab_execution"] is False

    bio_agent = BioResearchAgent()
    res_bio = bio_agent.run("Synthesize gene literature")
    assert res_bio["regulatory_commercial_approval_claimed"] is False


def test_seed_api_endpoints():
    res_list = client.get("/api/v1/seed/varieties/")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 2

    res_prof = client.get("/api/v1/seed/varieties/VAR-PADDY-CR1009")
    assert res_prof.status_code == 200
    assert "expected_yield_disclaimer" in res_prof.json()

    res_rec = client.post("/api/v1/seed/recommendations/", json={
        "farmer_ref": "FARMER-001",
        "crop_name": "Paddy",
        "season": "Kharif 2026",
        "soil_type": "Alluvial",
        "district": "Thanjavur"
    })
    assert res_rec.status_code == 200
    assert len(res_rec.json()) >= 1

    res_auth = client.post("/api/v1/seed/authenticity/", json={
        "batch_number": "BATCH-PADDY-001"
    })
    assert res_auth.status_code == 200
    assert "risk_status" in res_auth.json()
