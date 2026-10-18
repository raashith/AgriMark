import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "commodity_image_dataset.csv"


def test_commodity_image_dataset_has_unique_keys_and_image_targets():
    with DATASET.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))

    assert len(rows) >= 35
    keys = [row["commodity_key"] for row in rows]
    assert len(keys) == len(set(keys))
    for row in rows:
        assert row["canonical_name"].strip()
        assert row["category"].strip()
        assert row["commons_search_terms"].strip()
        assert row["image_file"] == f"{row['commodity_key']}.jpg"


def test_commodity_image_dataset_has_aliases_for_regional_names():
    with DATASET.open(encoding="utf-8", newline="") as handle:
        rows = {row["commodity_key"]: row for row in csv.DictReader(handle)}

    assert "arisi" in rows["rice"]["aliases"].split(";")
    assert "thakkali" in rows["tomato"]["aliases"].split(";")
    assert "vengayam" in rows["onion"]["aliases"].split(";")
    assert "karumbu" in rows["sugarcane"]["aliases"].split(";")
