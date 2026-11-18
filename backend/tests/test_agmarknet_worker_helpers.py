"""Regression checks for AGMARKNET source-field normalization."""

from scripts.data.ingest_agmarknet import normalize_record, parse_arrival_quantity


def test_arrival_quantity_reads_plain_source_field():
    assert parse_arrival_quantity({"Arrival Quantity": "12.5"}) == 12.5


def test_arrival_quantity_reads_source_unit_aliases():
    assert parse_arrival_quantity({"Arrivals (Tonnes)": "1,250"}) == 1250
    assert parse_arrival_quantity({"Arrival_Qty": "4"}) == 4


def test_arrival_quantity_does_not_invent_missing_or_invalid_values():
    assert parse_arrival_quantity({"Modal Price": "9500"}) is None
    assert parse_arrival_quantity({"Arrival Quantity": ""}) is None
    assert parse_arrival_quantity({"Arrival Quantity": "-2"}) is None


def test_normalize_record_decodes_data_gov_in_encoded_price_field_names():
    record = {
        "State": "Tamil Nadu",
        "District": "Kallakurichi",
        "Market": "Kallakurichi APMC",
        "Commodity": "Groundnut",
        "Variety": "TMV-7",
        "Grade": "FAQ",
        "Arrival_Date": "16/10/2026",
        "Min_x0020_Price": "6,500",
        "Modal_x0020_Price": "6,800",
        "Max_x0020_Price": "7,200",
    }

    normalized = normalize_record(record, "AGMARKNET")

    assert normalized is not None
    assert normalized["observation_date"] == "2026-10-16"
    assert normalized["min_price"] == 6500
    assert normalized["modal_price"] == 6800
    assert normalized["max_price"] == 7200
