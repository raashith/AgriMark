from openai import OpenAI

from ..core.config import get_settings


class AIService:
    model = "gpt-5-mini"

    def __init__(self) -> None:
        settings = get_settings()
        self._client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    @property
    def configured(self) -> bool:
        return self._client is not None

    def answer(self, prompt: str) -> str:
        if not self._client:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        try:
            response = self._client.responses.create(
                model=self.model,
                input=prompt,
            )
        except Exception as exc:
            raise RuntimeError("AI provider is temporarily unavailable") from exc
        text = response.output_text.strip() if response.output_text else ""
        if not text:
            raise RuntimeError("AI provider returned an empty response")
        return text
