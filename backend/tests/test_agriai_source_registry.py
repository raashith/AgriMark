import json
from pathlib import Path


REGISTRY_PATH = Path(__file__).resolve().parents[2] / "docs" / "AGRI_AI_DATA_SOURCE_REGISTRY.json"


def test_source_registry_has_provenance_and_no_automatic_training_approval():
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    assert registry["schema_version"] == "1.0.0"
    assert registry["policy"]["require_license_review_before_download"] is True
    assert registry["policy"]["require_training_permission_before_training"] is True

    assert registry["sources"]
    for source in registry["sources"]:
        assert source["id"]
        assert source["name"]
        assert source["provider"]
        assert source["url"].startswith("https://")
        assert source["license_or_terms"]
        assert source["status"] in registry["policy"]["statuses"]
        assert source.get("training_approval_required") is True
        # A catalog entry must never imply training permission merely from being listed.
        if source["status"] != "APPROVED_FOR_TRAINING":
            assert source.get("training_approval_required") is True
