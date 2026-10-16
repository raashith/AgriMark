from __future__ import annotations

import os
import re
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any, Mapping

import httpx

MARKET_SUPABASE_URL = os.getenv(
    "MARKET_SUPABASE_URL",
    "https://tsdjtlmrvbspyzgwmccg.supabase.co",
).rstrip("/")
# A publishable key is intended for browser/mobile clients and is constrained by RLS.
# It is not a service-role key. Override through the backend environment when rotating it.
MARKET_SUPABASE_PUBLISHABLE_KEY = os.getenv(
    "MARKET_SUPABASE_PUBLISHABLE_KEY",
    "sb_publishable_YvBVc_mQXS5606qGvJqZ1g_kg9ot7TF",
)
MARKET_HEADERS = {
    "apikey": MARKET_SUPABASE_PUBLISHABLE_KEY,
    "Authorization": f"Bearer {MARKET_SUPABASE_PUBLISHABLE_KEY}",
    "Accept": "application/json",
}


def _fetch_rows(
    client: httpx.Client,
    table: str,
    *,
    select: str,
    limit: int = 2000,
    order: str | None = None,
) -> list[dict[str, Any]]:
    params: dict[str, str] = {"select": select, "limit": str(limit)}
    if order:
        params["order"] = order
    response = client.get(f"{MARKET_SUPABASE_URL}/rest/v1/{table}", params=params)
    response.raise_for_status()
    result = response.json()
    if not isinstance(result, list):
        raise RuntimeError(f"Unexpected response from national market table {table}.")
    return [row for row in result if isinstance(row, dict)]


@lru_cache(maxsize=1)
def _market_dimensions() -> dict[str, list[dict[str, Any]]]:
    """Cache the mostly-static reference lists for this API worker process."""
    with httpx.Client(timeout=8.0, headers=MARKET_HEADERS) as client:
        return {
            "commodities": _fetch_rows(client, "national_commodities", select="code,name", order="name.asc"),
            "states": _fetch_rows(client, "national_states", select="state_code,state_name", order="state_name.asc"),
            "districts": _fetch_rows(client, "national_districts", select="district_code,district_name,state_code", order="district_name.asc"),
            "mandis": _fetch_rows(client, "national_mandis", select="mandi_code,mandi_name,district_code,state_code", order="mandi_name.asc"),
        }


def _contains_term(text: str, term: str) -> bool:
    term = term.strip().lower()
    if not term:
        return False
    # Word boundaries for Latin tokens avoid matching (for example) "tur" inside
    # unrelated words; substring match supports Indian scripts.
    if term.isascii() and any(char.isalnum() for char in term):
        return re.search(rf"\b{re.escape(term)}\b", text) is not None
    return term in text


def _match_option(
    options: list[dict[str, Any]],
    text: str,
    code_column: str,
    name_column: str,
    aliases: Mapping[str, str] | None = None,
) -> dict[str, Any] | None:
    if aliases:
        matched_aliases = [
            (alias, code)
            for alias, code in aliases.items()
            if _contains_term(text, alias)
        ]
        matched_aliases.sort(key=lambda item: len(item[0]), reverse=True)
        for _alias, code in matched_aliases:
            match = next(
                (
                    row for row in options
                    if str(row.get(code_column, "")).strip().lower() == code.strip().lower()
                    or str(row.get(name_column, "")).strip().lower() == code.strip().lower()
                ),
                None,
            )
            if match:
                return match

    # Resolve by the full display name before short codes, preferring the longest
    # matched name to avoid choosing a parent/sub-string location prematurely.
    named = [
        row for row in options
        if row.get(name_column) and _contains_term(text, str(row[name_column]))
    ]
    if named:
        return max(named, key=lambda row: len(str(row.get(name_column, ""))))

    for row in options:
        code = str(row.get(code_column, "")).strip()
        if code and code.lower() in text:
            return row
    return None


def build_market_context(
    message: str,
    *,
    commodity_aliases: Mapping[str, str] | None = None,
    state_codes: Mapping[str, str] | None = None,
) -> str:
    """Return factual AGMARKNET rows from the selected production market-data project."""
    text = (message or "").strip().lower()
    if not text:
        return "AGMARKNET OFFICIAL MARKET CONTEXT: no question was supplied."

    try:
        dimensions = _market_dimensions()
        commodity = _match_option(
            dimensions["commodities"], text, "code", "name", commodity_aliases
        )
        state = _match_option(dimensions["states"], text, "state_code", "state_name", state_codes)
        district = _match_option(dimensions["districts"], text, "district_code", "district_name")
        mandi = _match_option(dimensions["mandis"], text, "mandi_code", "mandi_name")

        params: dict[str, str] = {
            "select": "id,observation_date,state_code,district_code,mandi_code,commodity_code,variety,grade,min_price,max_price,modal_price,source",
            "order": "observation_date.desc,id.desc",
            "limit": "40",
        }
        if commodity:
            params["commodity_code"] = f"eq.{commodity['code']}"
        if state:
            params["state_code"] = f"eq.{state['state_code']}"
        if district:
            params["district_code"] = f"eq.{district['district_code']}"
        if mandi:
            params["mandi_code"] = f"eq.{mandi['mandi_code']}"

        with httpx.Client(timeout=8.0, headers=MARKET_HEADERS) as client:
            response = client.get(
                f"{MARKET_SUPABASE_URL}/rest/v1/national_market_price_observations",
                params=params,
            )
            response.raise_for_status()
            rows = response.json()
        if not isinstance(rows, list):
            raise RuntimeError("Unexpected response from national market observations.")
        rows = [row for row in rows if isinstance(row, dict)]

    except Exception as exc:
        raise RuntimeError("AGMARKNET market database is temporarily unavailable.") from exc

    location_names = {
        "states": {str(row.get("state_code")): str(row.get("state_name") or row.get("state_code")) for row in dimensions["states"]},
        "districts": {str(row.get("district_code")): str(row.get("district_name") or row.get("district_code")) for row in dimensions["districts"]},
        "mandis": {str(row.get("mandi_code")): str(row.get("mandi_name") or row.get("mandi_code")) for row in dimensions["mandis"]},
        "commodities": {str(row.get("code")): str(row.get("name") or row.get("code")) for row in dimensions["commodities"]},
    }

    # If the user named a commodity/state/location, never substitute prices for a
    # different item when no matching observation exists.
    if not rows:
        requested = []
        if commodity:
            requested.append(f"commodity {commodity.get('name') or commodity.get('code')}")
        if state:
            requested.append(f"state {state.get('state_name')}")
        if district:
            requested.append(f"district {district.get('district_name')}")
        if mandi:
            requested.append(f"mandi {mandi.get('mandi_name')}")
        filters = ", ".join(requested) if requested else "the requested filters"
        return (
            "AGMARKNET OFFICIAL MARKET CONTEXT\n"
            f"No matching official market observation was found for {filters}. "
            "Do not invent a price. Tell the user that no matching stored observation was found."
        )

    now = datetime.now(timezone.utc)
    lines = [
        "AGMARKNET OFFICIAL MARKET CONTEXT",
        "Source: Government of India AGMARKNET records imported from the supplied official dataset.",
        "Unit: INR per quintal.",
        "These are stored historical observations, not guaranteed live quotes, purchase offers, or predictions.",
    ]
    if commodity:
        lines.append(f"Commodity filter: {commodity.get('name') or commodity.get('code')}")
    if state:
        lines.append(f"State filter: {state.get('state_name') or state.get('state_code')}")
    if district:
        lines.append(f"District filter: {district.get('district_name') or district.get('district_code')}")
    if mandi:
        lines.append(f"Mandi filter: {mandi.get('mandi_name') or mandi.get('mandi_code')}")

    for row in rows[:12]:
        commodity_name = location_names["commodities"].get(str(row.get("commodity_code")), row.get("commodity_code"))
        state_name = location_names["states"].get(str(row.get("state_code")), row.get("state_code"))
        district_name = location_names["districts"].get(str(row.get("district_code")), row.get("district_code"))
        mandi_name = location_names["mandis"].get(str(row.get("mandi_code")), row.get("mandi_code"))
        geography = ", ".join(str(value) for value in (mandi_name, district_name, state_name) if value)
        lines.append(
            f"- commodity={commodity_name}; variety={row.get('variety') or 'not supplied'}; "
            f"grade={row.get('grade') or 'not supplied'}; location={geography or 'not supplied'}; "
            f"modal=₹{row.get('modal_price')}; min=₹{row.get('min_price')}; "
            f"max=₹{row.get('max_price')}; observation_date={row.get('observation_date')}; "
            f"source={row.get('source') or 'AGMARKNET'}"
        )

    latest = str(rows[0].get("observation_date") or "")
    if latest:
        try:
            observed_date = datetime.fromisoformat(latest[:10]).replace(tzinfo=timezone.utc)
            age_days = max((now - observed_date).total_seconds() / 86400, 0)
            lines.append(f"Freshness: newest returned observation is dated {latest[:10]} (approximately {age_days:.1f} days old).")
        except ValueError:
            pass

    lines.append("Grounding rule: use these rows for exact numerical prices only; preserve their observation dates and locations. Never make up a missing value.")
    return "\n".join(lines)
