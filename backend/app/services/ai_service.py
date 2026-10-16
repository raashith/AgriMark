import logging
import os

from sarvamai import SarvamAI

from ..core.config import get_settings

logger = logging.getLogger("ai_service")


class AIService:
    """AgriMark's primary text-generation service, powered by Sarvam AI."""

    model = "sarvam-105b-conversations"

    def __init__(self) -> None:
        settings = get_settings()
        api_key = (
            os.getenv("SARVAM_API_KEY")
            or getattr(settings, "sarvam_api_key", None)
        )
        self._client = (
            SarvamAI(api_subscription_key=api_key.strip())
            if api_key and api_key.strip()
            else None
        )

    @property
    def configured(self) -> bool:
        return self._client is not None

    def answer(self, prompt: str) -> str:
        if not prompt or not prompt.strip():
            raise ValueError("Please provide an agricultural query.")

        if not self._client:
            raise RuntimeError(
                "Sarvam AI is not configured. Add SARVAM_API_KEY to the agrimark-api "
                "service environment on Render."
            )

        try:
            response = self._client.chat.completions(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are AgriMark AI, a practical agricultural decision-support "
                            "assistant for Indian farmers. Answer clearly and concisely, "
                            "and respond in the language used by the farmer when possible. "
                            "Never invent live weather, prices, GPS, farm records, or "
                            "transactions. Use supplied official market/farm context as the "
                            "source of truth and clearly state when data is missing or stale. "
                            "Give safe, actionable farming guidance and explain uncertainty."
                        ),
                    },
                    {"role": "user", "content": prompt.strip()},
                ],
                temperature=0.2,
                max_tokens=700,
                reasoning_effort=None,
            )
            choices = getattr(response, "choices", None) or []
            text = (
                getattr(getattr(choices[0], "message", None), "content", None)
                if choices
                else None
            )
            if not isinstance(text, str) or not text.strip():
                logger.warning("Sarvam returned an empty completion (model=%s)", self.model)
                raise RuntimeError("Sarvam AI returned an empty response. Please try again.")
            return text.strip()
        except RuntimeError:
            raise
        except Exception as exc:
            status = getattr(exc, "status_code", None)
            if status in (401, 403):
                logger.error("Sarvam authentication failed; check server-side SARVAM_API_KEY.")
                raise RuntimeError(
                    "Sarvam API credentials are invalid. Update SARVAM_API_KEY in the "
                    "agrimark-api Render environment."
                ) from exc
            if status == 429:
                logger.warning("Sarvam rate limit or quota reached.")
                raise RuntimeError(
                    "Sarvam API rate limit or quota reached. Check your Sarvam plan and usage."
                ) from exc
            if status in (408, 504):
                logger.warning("Sarvam request timed out.")
                raise RuntimeError("Sarvam AI timed out. Please try again.") from exc
            logger.error("Sarvam completion failed (status=%s, error_type=%s)", status, type(exc).__name__)
            raise RuntimeError("Sarvam AI request failed. Please try again later.") from exc
