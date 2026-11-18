"""Regression checks for source-optional AGMARKNET arrival quantities."""

from scripts.data.ingest_agmarknet import parse_arrival_quantity


def test_arrival_quantity_reads_plain_source_field():
    assert parse_arrival_quantity({"Arrival Quantity": "12.5"}) == 12.5


def test_arrival_quantity_reads_source_unit_aliases():
    assert parse_arrival_quantity({"Arrivals (Tonnes)": "1,250"}) == 1250
    assert parse_arrival_quantity({"Arrival_Qty": "4"}) == 4


def test_arrival_quantity_does_not_invent_missing_or_invalid_values():
    assert parse_arrival_quantity({"Modal Price": "9500"}) is None
    assert parse_arrival_quantity({"Arrival Quantity": ""}) is None
    assert parse_arrival_quantity({"Arrival Quantity": "-2"}) is None
