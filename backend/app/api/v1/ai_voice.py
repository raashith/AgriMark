import urllib.parse
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Response

from ...services.ai_service import AIService
from ...services.sarvam_voice import SarvamVoiceService

logger = logging.getLogger("ai_voice")

router = APIRouter(prefix="/ai", tags=["ai"])

ALLOWED_AUDIO_TYPES = {
    "audio/webm", "audio/ogg", "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mp3", "audio/mpeg", "audio/aac", "audio/mp4", "audio/m4a",
    "application/octet-stream", "video/webm",
}


@router.post("/voice")
async def voice_assistant(
    file: UploadFile = File(...),
    language_code: str = Form("unknown"),
) -> Response:
    content_type = (file.content_type or "").split(";")[0].strip().lower()

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio recording submitted. Please speak clearly into your microphone.")

    if len(audio_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio recording exceeds maximum 10 MB limit. Please keep recordings under 30 seconds.")

    voice_service = SarvamVoiceService()
    if not voice_service.configured:
        raise HTTPException(status_code=503, detail="SARVAM_API_KEY is not configured on the AgriMark server.")

    filename = file.filename or "recording.webm"
    target_lang = (language_code or "unknown").strip()

    try:
        transcript, detected_lang = voice_service.transcribe(
            audio_bytes=audio_bytes,
            filename=filename,
            language_code=target_lang,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("STT processing failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to process speech input.") from exc

    try:
        answer_text = AIService().answer(transcript)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("AIService error: %s", exc)
        raise HTTPException(status_code=503, detail="AI provider request failed.") from exc

    try:
        tts_audio_bytes = voice_service.synthesize(
            text=answer_text,
            language_code=detected_lang,
        )
    except Exception as exc:
        logger.error("TTS processing failed: %s", exc)
        raise HTTPException(status_code=503, detail="Failed to synthesize audio response.") from exc

    encoded_transcript = urllib.parse.quote(transcript)
    encoded_answer = urllib.parse.quote(answer_text)
    headers = {
        "X-AgriMark-Transcript": encoded_transcript,
        "X-AgriMark-Answer": encoded_answer,
        "X-AgriMark-Language": detected_lang or "en-IN",
        "Access-Control-Expose-Headers": "X-AgriMark-Transcript, X-AgriMark-Answer, X-AgriMark-Language",
    }

    return Response(content=tts_audio_bytes, media_type="audio/wav", headers=headers)
