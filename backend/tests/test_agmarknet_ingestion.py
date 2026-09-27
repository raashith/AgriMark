"""
Unit and Integration Tests for AGMARKNET Data Ingestion Pipeline
"""

import sys
import os
import pytest

# Ensure scripts directory is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from scripts.data.ingest_agmarknet import (
    normalize_state,
    normalize_commodity,
    normalize_district,
    normalize_mandi,
    parse_date,
    parse_prices,
    run_ingestion,
)


def test_state_normalization():
    state_code, state_name, region = normalize_state("Tamil Nadu")
    assert state_code == "TN"
    assert state_name == "Tamil Nadu"
    assert region == "SOUTH"

    state_code2, state_name2, region2 = normalize_state("MAHARASHTRA")
    assert state_code2 == "MH"
    assert region2 == "WEST"

    state_code3, _, _ = normalize_state("Unknown Custom State")
    assert state_code3 == "UNKNOWN_CU"


def test_commodity_normalization():
    code, name, cat = normalize_commodity("Onion")
    assert code == "ONION"
    assert name == "Onion"
    assert cat == "VEGETABLES"

    code2, name2, cat2 = normalize_commodity("Paddy(Dhan)")
    assert code2 == "RICE"
    assert cat2 == "CEREALS"

    code3, name3, cat3 = normalize_commodity("Turmeric")
    assert code3 == "TURMERIC"
    assert cat3 == "SPICES"


def test_district_and_mandi_normalization():
    dist_code, dist_name = normalize_district("TN", "Kallakurichi")
    assert dist_code == "TN_KALLAKURICHI"
    assert dist_name == "Kallakurichi"

    mandi_code, mandi_name = normalize_mandi(dist_code, "Main Mandi Yard")
    assert mandi_code == "TN_KALLAKURICHI_MAIN_MANDI_YARD"
    assert mandi_name == "Main Mandi Yard"


def test_date_parsing():
    assert parse_date("01/05/2024") == "2024-05-01"
    assert parse_date("2024-05-01") == "2024-05-01"
    assert parse_date(None) is not None


def test_price_parsing_and_validation():
    # Valid range
    res = parse_prices(1500, 2500, 2000)
    assert res == (1500.0, 2500.0, 2000.0)

    # Reversed min/max
    res2 = parse_prices(2500, 1500, 2000)
    assert res2 == (1500.0, 2500.0, 2000.0)

    # Invalid negative prices
    res3 = parse_prices(-10, -5, -2)
    assert res3 is None

    # Extremely out of range prices
    res4 = parse_prices(1, 2, 3)
    assert res4 is None


def test_ingestion_dry_run_pipeline():
    counts = run_ingestion(start_date="2024-01-01", end_date="2024-01-02", dry_run=True)
    assert counts["downloaded"] > 0
    assert counts["accepted"] > 0
    assert counts["rejected"] == 0
    assert counts["inserted"] > 0
