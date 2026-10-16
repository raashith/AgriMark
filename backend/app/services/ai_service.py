import logging
import os

import httpx
from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

from ..core.config import get_settings

logger = logging.getLogger("ai_service")


class AIService:
    model = "gpt-5-mini"

    def __init__(self) -> None:
        settings = get_settings()
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        # Bound provider latency and avoid hidden SDK retry storms on a free-tier API.
        self._client = (
            OpenAI(api_key=api_key, timeout=25.0, max_retries=1)
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
                "AI provider is not configured. Add OPENAI_API_KEY to the agrimark-api "
                "service environment on Render."
            )

        try:
            response = self._client.responses.create(model=self.model, input=prompt)
            text = response.output_text.strip() if response.output_text else ""
            if not text:
                logger.warning("OpenAI returned an empty response (model=%s)", self.model)
                raise RuntimeError("AI provider returned an empty response. Please try again.")
            return text
        except AuthenticationError as exc:
            # Never log the SDK exception here: provider errors can contain key fragments.
            logger.error("OpenAI authentication failed; check the server-side OPENAI_API_KEY.")
            raise RuntimeError(
                "AI provider credentials are invalid. Update OPENAI_API_KEY in the "
                "agrimark-api Render environment, then redeploy."
            ) from exc
        except RateLimitError as exc:
            logger.warning("OpenAI rate limit or quota reached (model=%s)", self.model)
            raise RuntimeError(
                "AI provider rate limit or quota reached. Check the OpenAI API billing "
                "and usage limits, then try again."
            ) from exc
        except APITimeoutError as exc:
            logger.warning("OpenAI request timed out (model=%s)", self.model)
            raise RuntimeError("AI provider timed out. Please try again.") from exc
        except APIConnectionError as exc:
            logger.warning("OpenAI connection failed (model=%s)", self.model)
            raise RuntimeError("Cannot connect to the AI provider right now. Please try again.") from exc
        except APIStatusError as exc:
            # Log only status and request id, never headers or credentials.
            logger.error(
                "OpenAI request failed with status=%s request_id=%s",
                exc.status_code,
                getattr(exc, "request_id", None),
            )
            raise RuntimeError(
                f"AI provider returned an error (HTTP {exc.status_code}). Please try again later."
            ) from exc
        except RuntimeError:
            raise
        except Exception as exc:
            logger.error("Unexpected OpenAI client failure (%s)", type(exc).__name__)
            raise RuntimeError("AI provider request failed. Please try again later.") from exc
