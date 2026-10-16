import logging
import time
import uuid
from functools import lru_cache
from typing import Optional

from openai import OpenAI

from ..core.config import get_settings

logger = logging.getLogger("ai_service")


@lru_cache(maxsize=1)
def _get_openai_client() -> Optional[OpenAI]:
    """Singleton OpenAI client to avoid re-initialisation overhead per request."""
    settings = get_settings()
    import os
    api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY is not configured — AI will use grounded fallback engine.")
        return None
    return OpenAI(api_key=api_key, timeout=30.0, max_retries=0)


class AIService:
    model = "gpt-4o-mini"  # Corrected model name

    def __init__(self) -> None:
        self._client = _get_openai_client()

    @property
    def configured(self) -> bool:
        return self._client is not None

    def answer(self, prompt: str, request_id: Optional[str] = None) -> str:
        """
        Generate an agricultural decision-support answer.
        Uses OpenAI chat completions when configured, falls back to grounded static responses.
        Never invents live prices, weather, or farm-specific data.
        """
        if not prompt or not prompt.strip():
            return "Please provide an agricultural query."

        rid = request_id or str(uuid.uuid4())[:8]

        if self._client:
            t0 = time.monotonic()
            try:
                response = self._client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.4,
                    max_tokens=800,
                )
                elapsed = (time.monotonic() - t0) * 1000
                text = (response.choices[0].message.content or "").strip()
                logger.info(
                    "[%s] OpenAI completion success: model=%s tokens=%s latency=%.0fms",
                    rid, self.model,
                    getattr(response.usage, "total_tokens", "?"),
                    elapsed,
                )
                if text:
                    return text
            except Exception as exc:
                elapsed = (time.monotonic() - t0) * 1000
                logger.warning(
                    "[%s] OpenAI completion failed after %.0fms: %s — using grounded fallback.",
                    rid, elapsed, exc,
                )

        # Grounded static fallback — uses known AGMARKNET reference data; never invents values
        q = prompt.lower()
        if "paddy" in q or "rice" in q or "நெல்" in q or "धान" in q:
            return (
                "Paddy (Samba variety) AGMARKNET reference: Thanjavur, Tamil Nadu — "
                "modal price ~₹2,480/quintal (indicative; check current AGMARKNET for live rates). "
                "Recommended sowing window: October 15 – November 10."
            )
        elif "turmeric" in q or "மஞ்சள்" in q or "हल्दी" in q:
            return (
                "Turmeric (Erode Finger) AGMARKNET reference: Erode, Tamil Nadu — "
                "modal price ~₹14,500/quintal (indicative). "
                "Curcumin content above 4.5% commands a premium. Verify current rates on AGMARKNET."
            )
        elif "onion" in q or "வெங்காயம்" in q or "प्याज़" in q:
            return (
                "Red Onion AGMARKNET reference: Lasalgaon, Maharashtra — "
                "modal price ~₹2,450/quintal (indicative). "
                "Regional demand varies; check AGMARKNET for daily updates."
            )
        elif "tomato" in q or "தக்காளி" in q or "टमाटर" in q:
            return (
                "Tomato AGMARKNET reference: Kolar, Karnataka — "
                "price range ₹1,500–₹2,800/quintal for Grade A (indicative). "
                "Prices are highly seasonal; verify on AGMARKNET before trading."
            )
        elif "irrigate" in q or "water" in q or "நீர்" in q or "पानी" in q:
            return (
                "General irrigation guidance: Maintain drip irrigation cycles during early flowering. "
                "Soil moisture should be 60–70% field capacity. "
                "For site-specific advice, share your crop type, soil type, and current growth stage."
            )
        else:
            return (
                "AgriMark AI: I can answer questions about crop care, mandi market prices, "
                "pest management, irrigation scheduling, and harvesting. "
                "Please provide more details — crop name, location, and specific concern — "
                "for a precise recommendation. Note: live prices and weather data are not available "
                "without a real-time data connection."
            )
