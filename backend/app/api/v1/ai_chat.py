from __future__ import annotations

import re
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...core.database import get_supabase
from ...services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    context: str | None = Field(default=None, max_length=12000)


class AIChatResponse(BaseModel):
    answer: str
    model: str
    status: str


STATE_CODES = {
    "tamil nadu": "TN", "maharashtra": "MH", "karnataka": "KA",
    "andhra pradesh": "AP", "telangana": "TS", "kerala": "KL",
    "uttar pradesh": "UP", "punjab": "PB", "haryana": "HR",
    "madhya pradesh": "MP", "gujarat": "GJ", "west bengal": "WB",
    "bihar": "BR", "odisha": "OD", "rajasthan": "RJ", "assam": "AS",
    "jharkhand": "JH", "chhattisgarh": "CG", "himachal pradesh": "HP",
    "uttarakhand": "UK", "goa": "GA", "delhi": "DL",
}

COMMODITY_ALIASES = {
    "paddy": "PADDY", "rice": "RICE", "wheat": "WHEAT", "maize": "MAIZE",
    "corn": "CORN", "bajra": "BAJRA", "jowar": "JOWAR", "ragi": "RAGI",
    "onion": "ONION", "potato": "POTATO", "tomato": "TOMATO",
    "garlic": "GARLIC", "brinjal": "BRINJAL", "okra": "BHINDI",
    "bhindi": "BHINDI", "soybean": "SOYBEAN", "soyabean": "SOYABEAN",
    "groundnut": "GROUNDNUT", "peanut": "PEANUT", "mustard": "MUSTARD",
    "cotton": "COTTON", "chilli": "CHILLI", "chili": "CHILLI",
    "turmeric": "TURMERIC", "ginger": "GINGER", "cumin": "CUMIN",
    "coriander": "CORIANDER", "gram": "GRAM", "chana": "CHANA",
    "tur": "TUR", "arhar": "ARHAR", "moong": "MOONG", "urad": "URAD",
    "masur": "MASUR", "banana": "BANANA", "mango": "MANGO", "apple": "APPLE",
}

MARKET_TERMS = (
    "mandi", "market price", "market rate", "price", "bhav", "modal",
    "minimum price", "maximum price", "selling price", "sell", "buy",
    "commodity price", "agmarknet", "arrival",
)


def is_market_question(message: str) -> bool:
    text = message.lower()
    return any(term in text for term in MARKET_TERMS) or any(
        f" {commodity} " in f" {text} " for commodity in COMMODITY_ALIASES
    )


def extract_market_filters(message: str) -> tuple[str | None, str | None]:
    text = message.lower()
    commodity = next(
        (code for name, code in COMMODITY_ALIASES.items() if re.search(rf"\b{re.escape(name)}\b", text)),
        None,
    )
    state = next(
        (code for name, code in STATE_CODES.items() if name in text),
        None,
    )
    return commodity, state


def get_market_context(message: str) -> str:
    commodity, state = extract_market_filters(message)

    try:
        query = (
            get_supabase()
            .table("national_market_price_observations")
            .select(
                "commodity_code,variant_code,mandi_code,district_code,state_code,"
                "min_price,max_price,modal_price,observed_at,source,geography,unit"
            )
            .eq("price_signal_type", "OBSERVED_MANDI")
            .order("observed_at", desc=True)
            .limit(40)
        )
        if commodity:
            query = query.eq("commodity_code", commodity)
        if state:
            query = query.eq("state_code", state)

        rows = query.execute().data or []
    except Exception as exc:
        raise RuntimeError("AGMARKNET market database is temporarily unavailable.") from exc

    if not rows:
        return (
            "AGMARKNET DATABASE STATUS: connected, but no matching official observations "
            "have been ingested yet for this query. Do not invent a price. "
            "Tell the user that official observations are not available for the requested filters."
        )

    now = datetime.now(timezone.utc)
    lines = [
        "AGMARKNET OFFICIAL MARKET CONTEXT",
        "Source: Government of India AGMARKNET via data.gov.in.",
        "Unit: INR per quintal.",
        "These are observed administrative market reports, not predictions or guaranteed live quotes.",
    ]
    if commodity:
        lines.append(f"Commodity filter: {commodity}")
    if state:
        lines.append(f"State filter: {state}")

    for row in rows:
        observed = row.get("observed_at") or ""
        lines.append(
            f"- commodity={row.get('commodity_code')}; variant={row.get('variant_code')}; "
            f"mandi={row.get('mandi_code')}; geography={row.get('geography')}; "
            f"modal=₹{row.get('modal_price')}; min=₹{row.get('min_price')}; "
            f"max=₹{row.get('max_price')}; observed_at={observed}; source={row.get('source')}"
        )

    latest = rows[0].get("observed_at")
    if latest:
        try:
            age_days = (now - datetime.fromisoformat(latest.replace("Z", "+00:00"))).total_seconds() / 86400
            lines.append(f"Freshness: newest stored observation is approximately {max(age_days, 0):.1f} days old.")
        except ValueError:
            pass

    return "\n".join(lines)


@router.post("/chat", response_model=AIChatResponse)
def chat(request: AIChatRequest) -> AIChatResponse:
    prompt = request.message

    if is_market_question(request.message):
        try:
            market_context = get_market_context(request.message)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

        prompt = (
            "You are AgriMark AI, an agricultural decision-support assistant. "
            "The user is asking a market-related question. Use the supplied AGMARKNET "
            "database context as the source of truth for market observations. "
            "Never invent a price, mandi, arrival, date, or trend. "
            "Always distinguish an observed AGMARKNET price from a forecast. "
            "Mention the observation date/freshness when relevant. "
            "If no matching observation exists, say that clearly and do not substitute a fabricated value. "
            "For financial or trading decisions, provide informational guidance rather than a guarantee.\n\n"
            f"{market_context}\n\n"
            f"User:\n{request.message}"
        )
    elif request.context:
        prompt = (
            "You are AgriMark AI, an agricultural decision-support assistant. "
            "Use only the supplied context for claims about live farm telemetry, weather, "
            "market prices, logistics, or user-specific records. If the required live data "
            "is not supplied, say so clearly. Do not invent measurements or transactions. "
            "For high-impact farming or financial actions, provide a recommendation and ask "
            "the user to confirm before execution.\n\n"
            f"Context:\n{request.context}\n\nUser:\n{request.message}"
        )
    else:
        prompt = (
            "You are AgriMark AI, an agricultural decision-support assistant. "
            "Do not invent live weather, prices, GPS, farm records, or transactions. "
            "State uncertainty when current data is unavailable.\n\n"
            f"User:\n{request.message}"
        )

    try:
        answer = AIService().answer(prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI provider request failed") from exc

    return AIChatResponse(answer=answer, model="gpt-5-mini", status="ok")
