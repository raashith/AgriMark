from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    context: str | None = Field(default=None, max_length=12000)


class AIChatResponse(BaseModel):
    answer: str
    model: str
    status: str


@router.post("/chat", response_model=AIChatResponse)
def chat(request: AIChatRequest) -> AIChatResponse:
    prompt = request.message
    if request.context:
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
