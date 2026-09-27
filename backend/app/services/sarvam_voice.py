import base64
import os
import logging
from typing import Optional, Tuple

from sarvamai import SarvamAI
from ..core.config import get_settings

logger = logging.getLogger("sarvam_voice")

SUPPORTED_TTS_LANGUAGES = {
    "hi-IN", "bn-IN", "kn-IN", "ml-IN", "mr-IN",
    "od-IN", "pa-IN", "ta-IN", "te-IN", "en-IN", "gu-IN",
}

class SarvamVoiceService:
    def __init__(self, api_key: Optional[str] = None) -> None:
        settings = get_settings()
        self._api_key = api_key or os.getenv("SARVAM_API_KEY") or getattr(settings, "sarvam_api_key", None)
        if not self._api_key or not self._api_key.strip():
            self._client = None
        else:
            self._client = SarvamAI(api_subscription_key=self._api_key.strip())

    @property
    def configured(self) -> bool:
        return self._client is not None

    def transcribe(
        self,
        audio_bytes: bytes,
        filename: str = "recording.webm",
        language_code: str = "unknown",
    ) -> Tuple[str, str]:
        """
        Speech-to-Text using Sarvam Saaras v3 model.
        Returns (transcript_text, detected_language_code).
        """
        if not self._client:
            raise RuntimeError("SARVAM_API_KEY is not configured on the backend server.")

        lang = language_code if language_code and language_code != "auto" else "unknown"

        try:
            response = self._client.speech_to_text.transcribe(
                file=(filename, audio_bytes),
                model="saaras:v3",
                mode="transcribe",
                language_code=lang,
            )
        except Exception as exc:
            logger.error(f"Sarvam STT failed: {exc}")
            raise RuntimeError(f"Sarvam Speech-to-Text service error: {exc}") from exc

        transcript = getattr(response, "transcript", "") or ""
        detected_lang = getattr(response, "language_code", None) or lang
        
        if not transcript.strip():
            raise ValueError("No speech could be recognized in the provided audio recording.")

        return transcript.strip(), detected_lang

    def synthesize(self, text: str, language_code: Optional[str] = None) -> bytes:
        """
        Text-to-Speech using Sarvam Bulbul v3 model.
        Returns WAV audio bytes.
        """
        if not self._client:
            raise RuntimeError("SARVAM_API_KEY is not configured on the backend server.")

        if not text or not text.strip():
            raise ValueError("Cannot synthesize empty text response.")

        # Fallback safely to en-IN if language is missing, unknown, or unsupported by Bulbul TTS
        target_lang = language_code if language_code in SUPPORTED_TTS_LANGUAGES else "en-IN"

        try:
            response = self._client.text_to_speech.convert(
                text=text.strip(),
                model="bulbul:v3",
                language_code=target_lang,
            )
        except Exception as exc:
            logger.error(f"Sarvam TTS failed for language {target_lang}: {exc}")
            # Try fallback to en-IN if primary language conversion failed
            if target_lang != "en-IN":
                try:
                    response = self._client.text_to_speech.convert(
                        text=text.strip(),
                        model="bulbul:v3",
                        language_code="en-IN",
                    )
                except Exception as fallback_exc:
                    raise RuntimeError(f"Sarvam Text-to-Speech service error: {fallback_exc}") from fallback_exc
            else:
                raise RuntimeError(f"Sarvam Text-to-Speech service error: {exc}") from exc

        audios = getattr(response, "audios", [])
        if not audios or not audios[0]:
            raise RuntimeError("Sarvam TTS returned an empty audio payload.")

        try:
            audio_bytes = base64.b64decode(audios[0])
            return audio_bytes
        except Exception as exc:
            raise RuntimeError("Failed to decode Sarvam TTS audio payload.") from exc
