import pytest
from backend.app.services.data_provider_registry_service import DataProviderRegistryService
from backend.app.services.canonical_schema_registry_service import CanonicalSchemaRegistryService
from backend.app.services.semantic_normalization_service import SemanticNormalizationService
from backend.app.services.data_lineage_provenance_service import DataLineageProvenanceService
from backend.app.services.consent_purpose_policy_service import ConsentPurposePolicyService
from backend.app.services.selective_disclosure_service import SelectiveDisclosureService
from backend.app.services.agri_data_exchange_gateway import AgriDataExchangeGateway
from backend.app.services.agricultural_event_bus import AgriculturalEventBus
from backend.app.services.research_sandbox_dataset_builder import ResearchSandboxDatasetBuilder
from backend.app.services.data_trust_incident_service import DataTrustIncidentService
from backend.app.services.farmer_data_rights_service import FarmerDataRightsService
from backend.app.agents.data_agents import DataGovernanceAgent, ConsentAgent, DataIncidentAgent


def test_data_provider_and_consumer_registry():
    service = DataProviderRegistryService()
    providers = service.list_providers()
    consumers = service.list_consumers()
    assert len(providers) >= 3
    assert len(consumers) >= 2
    assert service.get_provider("prov-gov-001") is not None
    assert service.get_consumer("cons-agrimark-001") is not None


def test_canonical_schema_registry_and_drift():
    service = CanonicalSchemaRegistryService()
    schemas = service.list_schemas()
    assert len(schemas) >= 10

    # Test schema compatibility check
    compat = service.validate_schema_compatibility("Farmer", {"farmer_ref": "string", "name": "string", "phone": "string", "village": "string"})
    assert compat["is_compatible"] is True

    # Test drift detection
    drift = service.detect_schema_drift({"farmer_ref": "f-123", "unapproved_field": "test"}, "Farmer")
    assert drift["drift_detected"] is True
    assert drift["severity"] == "MEDIUM"



def test_semantic_multilingual_and_unit_normalization():
    service = SemanticNormalizationService()

    # Tamil term resolution
    res_ta = service.resolve_crop_canonical("தக்காளி")
    assert res_ta["canonical_id"] == "TOMATO"

    # Hindi term resolution
    res_hi = service.resolve_crop_canonical("टमाटर")
    assert res_hi["canonical_id"] == "TOMATO"

    # Unit conversion
    unit_res = service.normalize_unit(2.5, "QUINTAL", "KG")
    assert unit_res["normalized_value"] == 250.0
    assert unit_res["normalized_unit"] == "KG"


def test_data_lineage_graph_forward_and_reverse():
    service = DataLineageProvenanceService()
    fwd = service.get_forward_lineage("w-obs-001")
    assert len(fwd) >= 6

    rev = service.get_reverse_lineage("act-001")
    assert len(rev) >= 6


def test_consent_and_purpose_policy_engine():
    service = ConsentPurposePolicyService()

    # Valid permission check
    perm = service.validate_access_permission("farmer-001", "cons-agrimark-001", "ADVISORY", "CROP")
    assert perm["permitted"] is True

    # Withdraw consent
    service.withdraw_consent("farmer-001", "cons-agrimark-001", "ADVISORY")
    perm_after = service.validate_access_permission("farmer-001", "cons-agrimark-001", "ADVISORY", "CROP")
    assert perm_after["permitted"] is False
    assert "Active consent not granted" in perm_after["reason"]


def test_selective_disclosure_and_anti_reidentification():
    service = SelectiveDisclosureService()

    # Range claim
    claim = service.generate_selective_claim("farm_size", 3.5, {"type": "RANGE", "min": 2.0})
    assert claim["is_satisfied"] is True
    assert claim["disclosed_claim"] == "farm_size >= 2.0"

    # Small cohort suppression
    records = [{"district": "Salem", "crop": "TOMATO", "yield": 12.0}] * 3 # Only 3 records (< 5)
    aggregated = service.sanitize_cohort_aggregate(records, ["district", "crop"], "yield")
    assert aggregated[0]["status"] == "SUPPRESSED_SMALL_COHORT"
    assert aggregated[0]["aggregate_val"] is None


def test_agri_data_exchange_gateway_pipeline():
    gateway = AgriDataExchangeGateway(
        provider_registry=DataProviderRegistryService(),
        schema_registry=CanonicalSchemaRegistryService(),
        semantic_norm=SemanticNormalizationService(),
        consent_policy=ConsentPurposePolicyService(),
        selective_disc=SelectiveDisclosureService(),
        lineage_service=DataLineageProvenanceService()
    )

    req = {
        "consumer_id": "cons-agrimark-001",
        "farmer_ref": "farmer-001",
        "purpose": "ADVISORY",
        "domain": "CROP",
        "requested_fields": ["crop_name", "quantity"],
        "raw_data": {"crop_name": "தக்காளி", "quantity": 5.0, "phone": "+919876543210"},
        "original_unit": "QUINTAL"
    }

    res = gateway.process_data_exchange_request(req)
    assert res["status"] == "DELIVERED"
    assert res["delivered_data"]["crop_name_canonical"] == "TOMATO"
    assert res["delivered_data"]["quantity_normalized"] == 500.0
    assert "phone" not in res["delivered_data"] # PII minimized


def test_agricultural_event_bus_idempotency_and_replay():
    bus = AgriculturalEventBus()

    received = []
    bus.subscribe("WEATHER_ALERT", lambda e: received.append(e))

    res1 = bus.publish_event("WEATHER_ALERT", {"station": "Salem", "temp": 42.0}, event_id="evt-100")
    assert res1["status"] == "PUBLISHED"
    assert len(received) == 1

    # Idempotent re-publication
    res2 = bus.publish_event("WEATHER_ALERT", {"station": "Salem", "temp": 42.0}, event_id="evt-100")
    assert res2["status"] == "DUPLICATE_IGNORED"
    assert len(received) == 1


def test_research_sandbox_and_ai_dataset_builder():
    builder = ResearchSandboxDatasetBuilder()
    ds = builder.create_ai_dataset("TestDataset", {"start": "2025-01-01", "end": "2025-12-31"}, ["TN"], ["TOMATO"])
    assert ds["is_reproducible"] is True

    synthetic = builder.generate_synthetic_sandbox_data("WEATHER", sample_size=5)
    assert len(synthetic) == 5

    impact = builder.build_model_to_data_impact_graph(ds["id"])
    assert len(impact["impacted_components"]["models"]) >= 2


def test_data_trust_score_and_incidents():
    service = DataTrustIncidentService()
    trust = service.calculate_data_trust_score(90.0, 95.0, 85.0, 90.0)
    assert trust["trust_tier"] == "HIGH"
    assert trust["overall_trust_score"] == 90.5


    inc = service.report_incident({"incident_type": "POISONING", "severity": "CRITICAL"})
    assert inc["status"] == "DETECTED"

    updated = service.update_incident_status(inc["id"], "CONTAINED", "Quarantined input pipeline")
    assert updated["status"] == "CONTAINED"


def test_farmer_data_rights_service():
    service = FarmerDataRightsService()
    profile = service.view_farmer_data("farmer-001")
    assert profile["profile"]["name"] == "Murugan K."

    history = service.get_access_history("farmer-001")
    assert len(history) >= 2

    export = service.export_farmer_data("farmer-001")
    assert export["format"] == "JSON"


def test_specialist_data_ai_agents():
    gov_agent = DataGovernanceAgent()
    res = gov_agent.run("Review access request for bank loan verification")
    assert res["decision"] == "APPROVED_WITH_PURPOSE_LIMITATION"

    consent_agent = ConsentAgent()
    res_c = consent_agent.run("Verify consent")
    assert res_c["can_grant_self_access"] is False # Safety rule check
