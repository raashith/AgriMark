import logging
import os

from openai import OpenAI

from ..core.config import get_settings

logger = logging.getLogger("ai_service")


class AIService:
    model = "gpt-5-mini"

    def __init__(self) -> None:
        settings = get_settings()
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        # Bound upstream wait time so a stalled provider cannot tie up a worker indefinitely.
        self._client = (
            OpenAI(api_key=api_key, timeout=25.0, max_retries=1)
            if api_key
            else None
        )

    @property
    def configured(self) -> bool:
        return self._client is not None

    def answer(self, prompt: str) -> str:
        if not prompt or not prompt.strip():
            raise ValueError("Please provide an agricultural query.")

        if not self._client:
            raise RuntimeError("AI provider is not configured.")

        try:
            response = self._client.responses.create(
                model=self.model,
                input=prompt,
                max_output_tokens=700,
            )
            text = response.output_text.strip() if response.output_text else ""
            if not text:
                raise RuntimeError("AI provider returned an empty response.")
            return text
        except Exception as exc:
            logger.error("OpenAI completion failed: %s", exc)
            raise RuntimeError("AI provider request failed.") from exc
