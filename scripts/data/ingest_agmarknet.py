#!/usr/bin/env python3
"""Production AGMARKNET -> Supabase ingestion worker.

Uses only official data.gov.in AGMARKNET resources:
- Historical: 35985678-0d79-46b4-9ed6-6f13308a1d24
- Daily:      9ef84268-d588-465a-a308-a864a43d0070

The worker is deliberately fail-closed: it never generates synthetic market
observations and never falls back to demo data.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any, TypedDict

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "backend", ".env"))

LOG = logging.getLogger("agrimark.agmarknet")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

HISTORICAL_RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"
DAILY_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
OGD_BASE_URL = "https://api.data.gov.in/resource/"
PAGE_SIZE = 1000

STATE_MAPPINGS: dict[str, tuple[str, str]] = {
    "TAMIL NADU": ("TN", "SOUTH"), "MAHARASHTRA": ("MH", "WEST"),
    "KARNATAKA": ("KA", "SOUTH"), "UTTAR PRADESH": ("UP", "NORTH"),
    "PUNJAB": ("PB", "NORTH"), "HARYANA": ("HR", "NORTH"),
    "MADHYA PRADESH": ("MP", "CENTRAL"), "GUJARAT": ("GJ", "WEST"),
    "WEST BENGAL": ("WB", "EAST"), "ANDHRA PRADESH": ("AP", "SOUTH"),
    "TELANGANA": ("TS", "SOUTH"), "RAJASTHAN": ("RJ", "WEST"),
    "BIHAR": ("BR", "EAST"), "KERALA": ("KL", "SOUTH"),
    "ODISHA": ("OD", "EAST"), "ASSAM": ("AS", "NORTHEAST"),
    "CHHATTISGARH": ("CG", "CENTRAL"), "JHARKHAND": ("JH", "EAST"),
    "HIMACHAL PRADESH": ("HP", "NORTH"), "UTTARAKHAND": ("UK", "NORTH"),
    "GOA": ("GA", "WEST"), "DELHI": ("DL", "NORTH"),
}

COMMODITY_CATEGORIES: dict[str, str] = {
    "RICE": "CEREALS", "PADDY": "CEREALS", "WHEAT": "CEREALS",
    "MAIZE": "CEREALS", "CORN": "CEREALS", "BAJRA": "CEREALS",
    "JOWAR": "CEREALS", "RAGI": "CEREALS", "BARLEY": "CEREALS",
    "GRAM": "PULSES", "CHANA": "PULSES", "CHICKPEA": "PULSES",
    "ARHAR": "PULSES", "TUR": "PULSES", "MOONG": "PULSES",
    "URAD": "PULSES", "MASUR": "PULSES",
    "SOYABEAN": "OILSEEDS", "SOYBEAN": "OILSEEDS", "GROUNDNUT": "OILSEEDS",
    "PEANUT": "OILSEEDS", "MUSTARD": "OILSEEDS", "SESAMUM": "OILSEEDS",
    "ONION": "VEGETABLES", "POTATO": "VEGETABLES", "TOMATO": "VEGETABLES",
    "GARLIC": "VEGETABLES", "BRINJAL": "VEGETABLES", "BHINDI": "VEGETABLES",
    "BANANA": "FRUITS", "APPLE": "FRUITS", "MANGO": "FRUITS",
    "CHILLI": "SPICES", "TURMERIC": "SPICES", "GINGER": "SPICES",
    "CUMIN": "SPICES", "CORIANDER": "SPICES", "COTTON": "FIBER",
}

def slug(value: Any) -> str:
    return re.sub(r"[^A-Z0-9]+", "_", str(value or "").strip().upper()).strip("_") or "UNKNOWN"

def normalize_name(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").strip().lower()).strip()

def unique_by(rows: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    """Keep one metadata row per Postgres conflict key in a bulk upsert."""
    unique: dict[str, dict[str, Any]] = {}
    for row in rows:
        unique[str(row[key])] = row
    return list(unique.values())

class Catalog(TypedDict):
    states: dict[str, str]
    districts: dict[tuple[str, str], str]
    mandis: dict[tuple[str, str, str], str]
    commodities: dict[str, str]

def fetch_all_table_rows(client: Client, table: str, columns: str, order_column: str) -> list[dict[str, Any]]:
    """Read every lookup row in stable, bounded PostgREST pages."""
    rows: list[dict[str, Any]] = []
    offset = 0
    while True:
        page = (
            client.table(table)
            .select(columns)
            .order(order_column)
            .range(offset, offset + PAGE_SIZE - 1)
            .execute()
            .data
            or []
        )
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            break
        offset += len(page)
    return rows

def load_catalog(client: Client) -> Catalog:
    """Reuse all canonical lookup IDs so ingestion never creates duplicate slugs."""
    state_rows = fetch_all_table_rows(client, "national_states", "state_code,state_name", "state_code")
    district_rows = fetch_all_table_rows(client, "national_districts", "district_code,state_code,district_name", "district_code")
    mandi_rows = fetch_all_table_rows(client, "national_mandis", "mandi_code,state_code,district_code,mandi_name", "mandi_code")
    commodity_rows = fetch_all_table_rows(client, "national_commodities", "code,name", "code")

    return {
        "states": {normalize_name(row["state_name"]): str(row["state_code"]) for row in state_rows},
        "districts": {
            (str(row["state_code"]), normalize_name(row["district_name"])): str(row["district_code"])
            for row in district_rows
        },
        "mandis": {
            (str(row["state_code"]), str(row["district_code"]), normalize_name(row["mandi_name"])): str(row["mandi_code"])
            for row in mandi_rows
        },
        "commodities": {normalize_name(row["name"]): str(row["code"]) for row in commodity_rows},
    }

def field(record: dict[str, Any], name: str, default: Any = None) -> Any:
    wanted = name.lower().replace(" ", "_")
    for key, value in record.items():
        normalized = str(key).strip().lower().replace(" ", "_")
        if normalized == wanted:
            return value
    return default

def parse_date(value: Any) -> str | None:
    raw = str(value or "").strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(raw, fmt).date().isoformat()
        except ValueError:
            continue
    return None

def number(value: Any) -> float | None:
    try:
        cleaned = str(value).replace(",", "").strip()
        if not cleaned:
            return None
        return float(cleaned)
    except (TypeError, ValueError):
        return None

def normalize_record(record: dict[str, Any], source: str, catalog: Catalog) -> dict[str, Any] | None:
    state = str(field(record, "state", "")).strip()
    district = str(field(record, "district", "")).strip()
    market = str(field(record, "market", "")).strip()
    commodity = str(field(record, "commodity", "")).strip()
    variety = str(field(record, "variety", "Standard")).strip() or "Standard"
    grade = str(field(record, "grade", "STANDARD")).strip() or "STANDARD"
    arrival_date = parse_date(field(record, "arrival_date"))
    minimum = number(field(record, "min_price"))
    maximum = number(field(record, "max_price"))
    modal = number(field(record, "modal_price"))

    if not all((state, district, market, commodity, arrival_date)):
        return None
    if minimum is None or maximum is None or modal is None:
        return None
    if minimum < 0 or maximum < minimum or modal < minimum or modal > maximum:
        return None

    state_code = catalog["states"].get(normalize_name(state))
    if state_code:
        region = STATE_MAPPINGS.get(state.upper(), ("", "CENTRAL"))[1]
    else:
        state_code, region = STATE_MAPPINGS.get(state.upper(), (slug(state)[:10], "CENTRAL"))

    district_code = catalog["districts"].get((state_code, normalize_name(district)))
    if not district_code:
        district_code = f"{state_code}_{slug(district)}"

    mandi_code = catalog["mandis"].get((state_code, district_code, normalize_name(market)))
    if not mandi_code:
        mandi_code = f"{district_code}_{slug(market)}"

    commodity_code = catalog["commodities"].get(normalize_name(commodity)) or slug(commodity)
    variant_code = f"{commodity_code}_{slug(variety)}"
    category = next((cat for token, cat in COMMODITY_CATEGORIES.items() if token in commodity.upper()), "CEREALS")

    return {
        "commodity_code": commodity_code,
        "variant_code": variant_code,
        "mandi_code": mandi_code,
        "district_code": district_code,
        "state_code": state_code,
        "state_name": state.title(),
        "region": region,
        "district_name": district.title(),
        "mandi_name": market.title(),
        "commodity_name": commodity.title(),
        "variant_name": variety.title(),
        "grade_name": grade.upper(),
        "min_price": round(minimum, 2),
        "max_price": round(maximum, 2),
        "modal_price": round(modal, 2),
        "observed_at": f"{arrival_date}T06:00:00Z",
        "observation_date": arrival_date,
        "source": source,
        "source_url": f"{OGD_BASE_URL}{HISTORICAL_RESOURCE_ID if source == 'AGMARKNET_HISTORICAL' else DAILY_RESOURCE_ID}",
        "raw": record,
        "category": category,
    }

def fetch_page(api_key: str, resource_id: str, offset: int) -> tuple[list[dict[str, Any]], int]:
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": str(PAGE_SIZE),
        "offset": str(offset),
    }
    url = f"{OGD_BASE_URL}{resource_id}?{urllib.parse.urlencode(params)}"
    last_error: Exception | None = None
    for attempt in range(1, 4):
        try:
            request = urllib.request.Request(
                url,
                headers={"User-Agent": "AgriMark/1.0 (+https://agrimark.com)"},
            )
            with urllib.request.urlopen(request, timeout=60) as response:
                if response.status != 200:
                    raise RuntimeError(f"data.gov.in HTTP {response.status}")
                payload = json.loads(response.read().decode("utf-8"))
                return payload.get("records", []) or [], int(payload.get("total", 0) or 0)
        except Exception as exc:
            last_error = exc
            LOG.warning("AGMARKNET fetch attempt %s/3 failed: %s", attempt, exc)
            time.sleep(2 ** attempt)
    raise RuntimeError(f"AGMARKNET fetch failed: {last_error}")

def supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "https://tsdjtlmrvbspyzgwmccg.supabase.co"
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY")
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is required")
    return create_client(url, key)

def get_state(client: Client) -> dict[str, Any]:
    result = client.table("national_agmarknet_ingestion_state").select("*").eq("id", 1).single().execute()
    return result.data or {"id": 1, "historical_offset": 0, "daily_offset": 0}

def update_state(client: Client, patch: dict[str, Any]) -> None:
    client.table("national_agmarknet_ingestion_state").update(
        {**patch, "updated_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", 1).execute()

def persist_page(client: Client, rows: list[dict[str, Any] | None]) -> dict[str, int]:
    valid_rows = [row for row in rows if row]
    rejected = len(rows) - len(valid_rows)

    # A single 1,000-row page can contain thousands of repeated dimension keys.
    # PostgREST rejects an ON CONFLICT batch that targets the same row twice.
    states = unique_by(
        [{"state_code": r["state_code"], "state_name": r["state_name"]} for r in valid_rows],
        "state_code",
    )
    districts = unique_by(
        [{"state_code": r["state_code"], "district_code": r["district_code"], "district_name": r["district_name"]} for r in valid_rows],
        "district_code",
    )
    mandis = unique_by(
        [{"state_code": r["state_code"], "district_code": r["district_code"], "mandi_code": r["mandi_code"], "mandi_name": r["mandi_name"]} for r in valid_rows],
        "mandi_code",
    )
    commodities = unique_by(
        [{"code": r["commodity_code"], "name": r["commodity_name"]} for r in valid_rows],
        "code",
    )

    if states:
        client.table("national_states").upsert(states, on_conflict="state_code").execute()
    if districts:
        client.table("national_districts").upsert(districts, on_conflict="district_code").execute()
    if mandis:
        client.table("national_mandis").upsert(mandis, on_conflict="mandi_code").execute()
    if commodities:
        client.table("national_commodities").upsert(commodities, on_conflict="code").execute()

    # Deduplicate observations inside this page using the database's actual
    # unique key before sending one upsert request.
    observations_by_key: dict[tuple[str, str, str, str, str, str], dict[str, Any]] = {}
    for r in valid_rows:
        arrival = number(field(r["raw"], "arrival_quantity", field(r["raw"], "arrival")))
        observation = {
            "observation_date": r["observation_date"],
            "state_code": r["state_code"],
            "district_code": r["district_code"],
            "mandi_code": r["mandi_code"],
            "commodity_code": r["commodity_code"],
            "variety": r["variant_name"],
            "grade": r["grade_name"],
            "arrival_quantity": arrival,
            "min_price": r["min_price"],
            "max_price": r["max_price"],
            "modal_price": r["modal_price"],
            "source": "AGMARKNET",
            "source_record_id": "|".join((r["observation_date"], r["mandi_code"], r["commodity_code"], r["variant_name"], r["grade_name"])),
            "raw_record": r["raw"],
        }
        conflict_key = (
            observation["observation_date"],
            observation["mandi_code"],
            observation["commodity_code"],
            observation["variety"],
            observation["grade"],
            observation["source"],
        )
        observations_by_key[conflict_key] = observation

    observations = list(observations_by_key.values())
    if not observations:
        return {
            "accepted": 0,
            "upserted": 0,
            "duplicates_in_page": len(valid_rows),
            "rejected": rejected,
        }

    result = client.table("national_market_price_observations").upsert(
        observations,
        on_conflict="observation_date,mandi_code,commodity_code,variety,grade,source",
    ).select("id").execute()
    return {
        "accepted": len(valid_rows),
        "upserted": len(result.data or []),
        "duplicates_in_page": len(valid_rows) - len(observations),
        "rejected": rejected,
    }

def ingest_one_page(
    client: Client,
    api_key: str,
    mode: str,
    offset: int,
    catalog: Catalog,
) -> dict[str, Any]:
    resource_id = HISTORICAL_RESOURCE_ID if mode == "historical" else DAILY_RESOURCE_ID
    source = "AGMARKNET_HISTORICAL" if mode == "historical" else "AGMARKNET_DAILY"
    records, total = fetch_page(api_key, resource_id, offset)
    normalized = [normalize_record(record, source, catalog) for record in records]
    counts = persist_page(client, normalized)

    next_offset = offset + len(records)
    finished = not records or next_offset >= total
    return {
        "mode": mode, "resource_id": resource_id, "offset_start": offset,
        "offset_end": next_offset, "total": total, "fetched": len(records),
        "finished": finished, **counts,
    }

def run(mode: str) -> dict[str, Any]:
    api_key = (os.getenv("DATA_GOV_IN_API_KEY") or os.getenv("AGMARKNET_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("DATA_GOV_IN_API_KEY is required. Refusing to generate or ingest synthetic market data.")

    client = supabase_client()
    catalog = load_catalog(client)
    state = get_state(client)

    selected_mode = mode
    if mode == "both":
        historical_offset = int(state.get("historical_offset") or 0)
        historical_total = state.get("last_historical_total")
        selected_mode = "historical" if historical_total is None or historical_offset < int(historical_total) else "daily"

    offset_key = "historical_offset" if selected_mode == "historical" else "daily_offset"
    last_run_key = "last_historical_run_at" if selected_mode == "historical" else "last_daily_run_at"
    total_key = "last_historical_total" if selected_mode == "historical" else "last_daily_total"
    offset = int(state.get(offset_key) or 0)

    result = ingest_one_page(client, api_key, selected_mode, offset, catalog)
    now = datetime.now(timezone.utc).isoformat()
    next_offset = 0 if result["finished"] and selected_mode == "daily" else result["offset_end"]

    update_state(client, {
        offset_key: next_offset,
        last_run_key: now,
        total_key: result["total"],
        "last_run_status": "SUCCESS",
        "last_error": None,
    })
    LOG.info(
        "%s: offset %s -> %s, fetched=%s accepted=%s upserted=%s duplicates_in_page=%s rejected=%s total=%s",
        selected_mode, offset, result["offset_end"], result["fetched"], result["accepted"],
        result["upserted"], result["duplicates_in_page"], result["rejected"], result["total"],
    )
    return result

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("historical", "daily", "both"), default="both")
    args = parser.parse_args()
    try:
        result = run(args.mode)
        print(json.dumps(result, default=str))
    except Exception as exc:
        LOG.exception("AGMARKNET ingestion failed")
        try:
            client = supabase_client()
            update_state(client, {"last_run_status": "FAILED", "last_error": str(exc)})
        except Exception:
            pass
        raise

if __name__ == "__main__":
    main()
