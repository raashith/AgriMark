import base64
import logging
import time
import uuid
from functools import lru_cache
from typing import Optional, Tuple

from sarvamai import SarvamAI
from ..core.config import get_settings

logger = logging.getLogger("sarvam_voice")

SUPPORTED_TTS_LANGUAGES = {
    "hi-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN",
    "od-IN", "pa-IN", "ta-IN", "te-IN", "en-IN", "gu-IN",
}

# Hard limits passed to Sarvam API
STT_TIMEOUT_SECONDS = 30
TTS_TIMEOUT_SECONDS = 20
# TTS: Bulbul v3 has a max text length per call
TTS_MAX_CHARS = 500


@lru_cache(maxsize=1)
def _get_sarvam_client() -> Optional[SarvamAI]:
    """Singleton SarvamAI client — constructed once per process."""
    import os
    settings = get_settings()
    api_key = os.getenv("SARVAM_API_KEY") or getattr(settings, "sarvam_api_key", None)
    if not api_key or not api_key.strip():
        logger.warning("SARVAM_API_KEY is not configured — voice features are unavailable.")
        return None
    return SarvamAI(api_subscription_key=api_key.strip())


class SarvamVoiceService:
    def __init__(self, api_key: Optional[str] = None) -> None:
        if api_key:
            # Allow override for testing; do NOT cache this instance
            self._client = SarvamAI(api_subscription_key=api_key.strip()) if api_key.strip() else None
        else:
            self._client = _get_sarvam_client()

    @property
    def configured(self) -> bool:
        return self._client is not None

    def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "recording.webm",
        language_code: str = "unknown",
        request_id: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Speech-to-Text via Sarvam Saaras v3.
        Returns (transcript_text, detected_language_code).
        Raises RuntimeError on provider failure, ValueError on empty transcript.
        """
        if not self._client:
            raise RuntimeError("SARVAM_API_KEY is not configured on the backend server.")

        rid = request_id or str(uuid.uuid4())[:8]
        lang = language_code if language_code and language_code not in ("auto", "unknown") else "unknown"

        t0 = time.monotonic()
        try:
            response = self._client.speech_to_text.transcribe(
                file=(filename, audio_bytes),
                model="saaras:v3",
                mode="transcribe",
                language_code=lang,
            )
        except Exception as exc:
            elapsed = (time.monotonic() - t0) * 1000
            logger.error("[%s] Sarvam STT failed after %.0fms: %s", rid, elapsed, exc)
            raise RuntimeError(f"Sarvam Speech-to-Text service error: {exc}") from exc

        elapsed = (time.monotonic() - t0) * 1000
        transcript = (getattr(response, "transcript", "") or "").strip()
        detected_lang = getattr(response, "language_code", None) or lang or "en-IN"

        logger.info(
            "[%s] Sarvam STT success: lang=%s detected=%s chars=%d latency=%.0fms",
            rid, lang, detected_lang, len(transcript), elapsed,
        )

        if not transcript:
            raise ValueError(
                "No speech could be recognized in the provided audio recording. "
                "Please speak clearly and ensure microphone access is granted."
            )

        return transcript, detected_lang

    def synthesize(
        self,
        text: str,
        language_code: Optional[str] = None,
        request_id: Optional[str] = None,
    ) -> bytes:
        """
        Text-to-Speech via Sarvam Bulbul v3.
        Returns raw WAV bytes.
        Raises RuntimeError on provider failure.
        """
        if not self._client:
            raise RuntimeError("SARVAM_API_KEY is not configured on the backend server.")

        if not text or not text.strip():
            raise ValueError("Cannot synthesize empty text response.")

        rid = request_id or str(uuid.uuid4())[:8]

        # Fallback to en-IN if language is missing, unknown, or unsupported
        target_lang = language_code if language_code in SUPPORTED_TTS_LANGUAGES else "en-IN"

        # Truncate to TTS limit to avoid API 400 errors on long responses
        tts_text = text.strip()[:TTS_MAX_CHARS]
        if len(text.strip()) > TTS_MAX_CHARS:
            logger.info(
                "[%s] TTS text truncated from %d to %d chars.",
                rid, len(text.strip()), TTS_MAX_CHARS,
            )

        t0 = time.monotonic()
        try:
            response = self._client.text_to_speech.convert(
                text=tts_text,
                model="bulbul:v3",
                language_code=target_lang,
            )
        except Exception as exc:
            elapsed = (time.monotonic() - t0) * 1000
            logger.error(
                "[%s] Sarvam TTS failed for lang=%s after %.0fms: %s",
                rid, target_lang, elapsed, exc,
            )
            # Try en-IN fallback if primary language failed
            if target_lang != "en-IN":
                try:
                    t1 = time.monotonic()
                    response = self._client.text_to_speech.convert(
                        text=tts_text,
                        model="bulbul:v3",
                        language_code="en-IN",
                    )
                    elapsed2 = (time.monotonic() - t1) * 1000
                    logger.info(
                        "[%s] Sarvam TTS en-IN fallback success: %.0fms", rid, elapsed2,
                    )
                except Exception as fallback_exc:
                    raise RuntimeError(
                        f"Sarvam Text-to-Speech service error (primary and fallback): {fallback_exc}"
                    ) from fallback_exc
            else:
                raise RuntimeError(f"Sarvam Text-to-Speech service error: {exc}") from exc
        else:
            elapsed = (time.monotonic() - t0) * 1000
            logger.info(
                "[%s] Sarvam TTS success: lang=%s latency=%.0fms", rid, target_lang, elapsed,
            )

        audios = getattr(response, "audios", [])
        if not audios or not audios[0]:
            raise RuntimeError("Sarvam TTS returned an empty audio payload.")

        try:
            return base64.b64decode(audios[0])
        except Exception as exc:
            raise RuntimeError("Failed to decode Sarvam TTS audio payload.") from exc
