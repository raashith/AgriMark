"""Regression tests for the official AGMARKNET ingestion worker."""

from scripts.data.ingest_agmarknet import (
    normalize_name,
    normalize_record,
    persist_page,
    unique_by,
)


def test_normalize_name_is_case_and_punctuation_insensitive():
    assert normalize_name("Himachal  Pradesh") == "himachal pradesh"
    assert normalize_name("Apple (Grade-B)") == "apple grade b"


def test_unique_by_keeps_one_row_for_each_conflict_key():
    rows = [
        {"state_code": "TN", "state_name": "Tamil Nadu"},
        {"state_code": "TN", "state_name": "Tamil Nadu"},
        {"state_code": "KA", "state_name": "Karnataka"},
    ]

    assert unique_by(rows, "state_code") == [
        {"state_code": "TN", "state_name": "Tamil Nadu"},
        {"state_code": "KA", "state_name": "Karnataka"},
    ]


def test_normalize_record_reuses_canonical_catalog_ids():
    catalog = {
        "states": {"tamil nadu": "st-tamil-nadu-12345678"},
        "districts": {
            ("st-tamil-nadu-12345678", "kallakurichi"): "dist-tamil-nadu-kallakurichi-12345678",
        },
        "mandis": {
            (
                "st-tamil-nadu-12345678",
                "dist-tamil-nadu-kallakurichi-12345678",
                "kallakurichi regulated market",
            ): "mandi-tamil-nadu-kallakurichi-12345678",
        },
        "commodities": {"onion": "com-onion-12345678"},
    }
    record = {
        "State": "Tamil Nadu",
        "District": "Kallakurichi",
        "Market": "Kallakurichi Regulated Market",
        "Commodity": "Onion",
        "Variety": "Bellary",
        "Grade": "FAQ",
        "Arrival_Date": "16/10/2026",
        "Min_Price": "1,500",
        "Max_Price": "2,500",
        "Modal_Price": "2,000.50",
        "Arrival_Quantity": "12",
    }

    normalized = normalize_record(record, "AGMARKNET_DAILY", catalog)

    assert normalized is not None
    assert normalized["state_code"] == "st-tamil-nadu-12345678"
    assert normalized["district_code"] == "dist-tamil-nadu-kallakurichi-12345678"
    assert normalized["mandi_code"] == "mandi-tamil-nadu-kallakurichi-12345678"
    assert normalized["commodity_code"] == "com-onion-12345678"
    assert normalized["modal_price"] == 2000.50
    assert normalized["observation_date"] == "2026-10-16"


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeQuery:
    def __init__(self, table, calls):
        self.table = table
        self.calls = calls
        self.rows = []

    def upsert(self, rows, on_conflict=None):
        self.rows = rows
        self.calls.append((self.table, on_conflict, rows))
        return self

    def select(self, columns):
        return self

    def execute(self):
        if self.table == "national_market_price_observations":
            return FakeResponse([{"id": index + 1} for index, _ in enumerate(self.rows)])
        return FakeResponse(self.rows)


class FakeClient:
    def __init__(self):
        self.calls = []

    def table(self, name):
        return FakeQuery(name, self.calls)


def test_persist_page_deduplicates_metadata_and_observations_before_upsert():
    row = {
        "state_code": "st-tamil-nadu-12345678",
        "state_name": "Tamil Nadu",
        "district_code": "dist-tamil-nadu-kallakurichi-12345678",
        "district_name": "Kallakurichi",
        "mandi_code": "mandi-tamil-nadu-kallakurichi-12345678",
        "mandi_name": "Kallakurichi Regulated Market",
        "commodity_code": "com-onion-12345678",
        "commodity_name": "Onion",
        "variant_name": "Bellary",
        "grade_name": "FAQ",
        "observation_date": "2026-10-16",
        "min_price": 1500.0,
        "max_price": 2500.0,
        "modal_price": 2000.5,
        "raw": {"Arrival_Quantity": "12"},
    }
    client = FakeClient()

    result = persist_page(client, [row, row])

    by_table = {table: rows for table, _, rows in client.calls}
    assert len(by_table["national_states"]) == 1
    assert len(by_table["national_districts"]) == 1
    assert len(by_table["national_mandis"]) == 1
    assert len(by_table["national_commodities"]) == 1
    assert len(by_table["national_market_price_observations"]) == 1
    assert result == {
        "accepted": 2,
        "upserted": 1,
        "duplicates_in_page": 1,
        "rejected": 0,
    }
