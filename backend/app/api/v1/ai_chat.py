import time
import uuid
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...services.ai_service import AIService

logger = logging.getLogger("ai_chat")

router = APIRouter(prefix="/ai", tags=["ai"])


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    context: str | None = Field(default=None, max_length=12000)
    language: str | None = Field(default=None, max_length=20)


class AIChatResponse(BaseModel):
    answer: str
    model: str
    status: str
    request_id: str
    latency_ms: int


@router.post("/chat", response_model=AIChatResponse)
async def chat(request: AIChatRequest) -> AIChatResponse:
    """
    AgriMark AI text chat endpoint.
    Accepts a user message and optional context (farm data, market prices, location).
    Returns an agricultural decision-support answer.
    """
    request_id = str(uuid.uuid4())[:12]
    t0 = time.monotonic()

    lang_hint = f" Respond in language: {request.language}." if request.language else ""

    if request.context:
        prompt = (
            "You are AgriMark AI, an agricultural decision-support assistant for Indian farmers. "
            "Use the supplied context for any claims about live farm telemetry, weather, market prices, "
            "logistics, or user-specific records. "
            "If required live data is not in the context, say so clearly — do NOT invent measurements or transactions. "
            "For high-impact farming or financial actions, recommend clearly and ask the user to confirm."
            f"{lang_hint}\n\n"
            f"Context:\n{request.context}\n\n"
            f"User:\n{request.message}"
        )
    else:
        prompt = (
            "You are AgriMark AI, an agricultural decision-support assistant for Indian farmers. "
            "Do not invent live weather, prices, GPS locations, farm records, or transactions. "
            "State clearly when current data is unavailable. "
            "For pest/disease questions, ask for crop type, symptoms, and region if not provided."
            f"{lang_hint}\n\n"
            f"User:\n{request.message}"
        )

    logger.info("[%s] Chat request: lang=%s msg_len=%d ctx_len=%d",
                request_id, request.language, len(request.message),
                len(request.context or ""))

    try:
        answer = AIService().answer(prompt, request_id=request_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("[%s] Unexpected AI error: %s", request_id, exc)
        raise HTTPException(status_code=502, detail="AI provider request failed") from exc

    latency_ms = round((time.monotonic() - t0) * 1000)
    logger.info("[%s] Chat response: latency=%dms answer_len=%d", request_id, latency_ms, len(answer))

    return AIChatResponse(
        answer=answer,
        model=AIService.model,
        status="ok",
        request_id=request_id,
        latency_ms=latency_ms,
    )
