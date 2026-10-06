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
from typing import Any

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

def normalize_record(record: dict[str, Any], source: str) -> dict[str, Any] | None:
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

    state_code, region = STATE_MAPPINGS.get(state.upper(), (slug(state)[:10], "CENTRAL"))
    district_code = f"{state_code}_{slug(district)}"
    mandi_code = f"{district_code}_{slug(market)}"
    commodity_code = slug(commodity)
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
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "https://xrcqzpnstdbbtafhcwbb.supabase.co"
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

def persist_page(client: Client, rows: list[dict[str, Any]]) -> dict[str, int]:
    accepted = [r for r in rows if r]
    if not accepted:
        return {"accepted": 0, "inserted": 0, "duplicates": 0, "rejected": len(rows)}

    states = [{"state_code": r["state_code"], "name": r["state_name"], "region": r["region"]} for r in accepted]
    districts = [{"state_code": r["state_code"], "district_code": r["district_code"], "name": r["district_name"]} for r in accepted]
    mandis = [{"district_code": r["district_code"], "mandi_code": r["mandi_code"], "name": r["mandi_name"]} for r in accepted]
    commodities = [{"code": r["commodity_code"], "name": r["commodity_name"], "category": r["category"], "standard_unit": "QUINTAL"} for r in accepted]
    variants = [{"variant_code": r["variant_code"], "variant_name": r["variant_name"], "grade": r["grade_name"]} for r in accepted]

    client.table("national_states").upsert(states, on_conflict="state_code").execute()
    client.table("national_districts").upsert(districts, on_conflict="district_code").execute()
    client.table("national_mandis").upsert(mandis, on_conflict="mandi_code").execute()
    client.table("national_commodities").upsert(commodities, on_conflict="code").execute()
    client.table("national_commodity_variants").upsert(variants, on_conflict="variant_code").execute()

    observations = []
    for r in accepted:
        observations.append({
            "commodity_code": r["commodity_code"],
            "variant_code": r["variant_code"],
            "mandi_code": r["mandi_code"],
            "district_code": r["district_code"],
            "state_code": r["state_code"],
            "price_signal_type": "OBSERVED_MANDI",
            "min_price": r["min_price"],
            "max_price": r["max_price"],
            "modal_price": r["modal_price"],
            "arrival_quantity_mt": 0,
            "observed_at": r["observed_at"],
            "source": r["source"],
            "source_url": r["source_url"],
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "published_at": r["observed_at"],
            "license": "OPEN_DATA_GOV_IN",
            "coverage_start": r["observation_date"],
            "coverage_end": r["observation_date"],
            "geography": f"{r['district_name']}, {r['state_name']}",
            "unit": "INR_PER_QUINTAL",
            "schema_version": "v2.0",
            "quality_score": 0.98,
            "validation_status": "VALIDATED",
            "data_layer": "CANONICAL",
            "is_synthetic": False,
        })

    result = client.table("national_market_price_observations").upsert(
        observations,
        on_conflict="commodity_code,variant_code,mandi_code,observed_at,source",
    ).execute()
    return {"accepted": len(accepted), "inserted": len(result.data or []), "duplicates": max(0, len(accepted) - len(result.data or [])), "rejected": len(rows) - len(accepted)}

def ingest_one_page(client: Client, api_key: str, mode: str, offset: int) -> dict[str, Any]:
    resource_id = HISTORICAL_RESOURCE_ID if mode == "historical" else DAILY_RESOURCE_ID
    source = "AGMARKNET_HISTORICAL" if mode == "historical" else "AGMARKNET_DAILY"
    records, total = fetch_page(api_key, resource_id, offset)
    normalized = [normalize_record(record, source) for record in records]
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

    result = ingest_one_page(client, api_key, selected_mode, offset)
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
        "%s: offset %s -> %s, fetched=%s accepted=%s inserted=%s rejected=%s total=%s",
        selected_mode, offset, result["offset_end"], result["fetched"], result["accepted"],
        result["inserted"], result["rejected"], result["total"],
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
