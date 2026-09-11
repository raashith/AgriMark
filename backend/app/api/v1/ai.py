from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ...services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["ai"])


class AIRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)


class AIResponse(BaseModel):
    answer: str


@router.post("/answer", response_model=AIResponse)
def answer(request: AIRequest) -> AIResponse:
    try:
        return AIResponse(answer=AIService().answer(request.prompt))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
