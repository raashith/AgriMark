from openai import OpenAI

from ..core.config import get_settings


class AIService:
    def __init__(self) -> None:
        settings = get_settings()
        self._client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    @property
    def configured(self) -> bool:
        return self._client is not None

    def answer(self, prompt: str) -> str:
        if not self._client:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        response = self._client.responses.create(
            model="gpt-5-mini",
            input=prompt,
        )
        return response.output_text
