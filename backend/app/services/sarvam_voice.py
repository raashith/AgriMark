import base64
import os

from sarvamai import SarvamAI


class SarvamVoiceService:
    def __init__(self) -> None:
        api_key = os.environ.get("SARVAM_API_KEY")
        if not api_key:
            raise RuntimeError("SARVAM_API_KEY is not configured")
        self._client = SarvamAI(api_subscription_key=api_key)

    def transcribe(self, audio_bytes: bytes, filename: str, language_code: str) -> str:
        try:
            from io import BytesIO

            audio_file = BytesIO(audio_bytes)
            audio_file.name = filename
            response = self._client.speech_to_text.transcribe(
                file=audio_file,
                model="saaras:v3",
                language_code=language_code,
                mode="transcribe",
            )
        except Exception as exc:
            raise RuntimeError("Sarvam speech-to-text request failed") from exc

        text = (response.transcript or "").strip()
        if not text:
            raise RuntimeError("Sarvam returned an empty transcription")
        return text

    def synthesize(self, text: str, language_code: str) -> bytes:
        try:
            response = self._client.text_to_speech.convert(
                text=text[:2500],
                target_language_code=language_code,
                speaker="shubh",
                model="bulbul:v3",
            )
        except Exception as exc:
            raise RuntimeError("Sarvam text-to-speech request failed") from exc

        if hasattr(response, "audios"):
            return base64.b64decode("".join(response.audios))
        if isinstance(response, bytes):
            return response
        raise RuntimeError("Sarvam returned no audio data")
