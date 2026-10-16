import urllib.parse
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Response
from starlette.concurrency import run_in_threadpool

from ...services.ai_service import AIService
from ...services.sarvam_voice import SarvamVoiceService

logger = logging.getLogger("ai_voice")

router = APIRouter(prefix="/ai", tags=["ai"])

MAX_AUDIO_BYTES = 10 * 1024 * 1024


@router.post("/voice")
async def voice_assistant(
    file: UploadFile = File(...),
    language_code: str = Form("unknown"),
) -> Response:
    audio_bytes = await file.read()
    await file.close()

    if not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty audio recording submitted. Please speak clearly into your microphone.",
        )

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Audio recording exceeds maximum 10 MB limit. Please keep recordings under 30 seconds.",
        )

    voice_service = SarvamVoiceService()
    if not voice_service.configured:
        raise HTTPException(
            status_code=503,
            detail="SARVAM_API_KEY is not configured on the AgriMark server.",
        )

    filename = file.filename or "recording.webm"
    target_lang = (language_code or "unknown").strip()

    try:
        # Sarvam's SDK is synchronous; move network I/O off the ASGI event loop.
        transcript, detected_lang = await run_in_threadpool(
            voice_service.transcribe,
            audio_bytes=audio_bytes,
            filename=filename,
            language_code=target_lang,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.warning("STT provider unavailable: %s", exc)
        raise HTTPException(status_code=503, detail="Speech recognition is temporarily unavailable. Please try again.") from exc
    except Exception as exc:
        logger.exception("STT processing failed")
        raise HTTPException(status_code=502, detail="Failed to process speech input.") from exc

    try:
        # Voice answers should be concise to reduce the time needed for speech synthesis.
        voice_prompt = (
            "You are AgriMark, a practical agricultural assistant for Indian farmers. "
            "Answer in the same language as the user's transcript whenever possible. "
            "For voice playback, keep the answer concise (about 2-5 short sentences). "
            "Give actionable, safe advice. Never invent live prices, weather, farm records, "
            "or diagnoses; state clearly when verified data is unavailable.\n\n"
            f"Farmer's question: {transcript}"
        )
        answer_text = await run_in_threadpool(AIService().answer, voice_prompt)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.warning("AI service unavailable for voice request: %s", exc)
        raise HTTPException(status_code=503, detail="AgriAI is temporarily busy. Please try again.") from exc
    except Exception as exc:
        logger.exception("AI service error during voice request")
        raise HTTPException(status_code=502, detail="AI provider request failed.") from exc

    try:
        tts_audio_bytes = await run_in_threadpool(
            voice_service.synthesize,
            text=answer_text,
            language_code=detected_lang,
        )
    except Exception as exc:
        logger.warning("TTS processing failed: %s", exc)
        raise HTTPException(status_code=503, detail="Voice playback is temporarily unavailable. Please try again.") from exc

    headers = {
        "X-AgriMark-Transcript": urllib.parse.quote(transcript),
        "X-AgriMark-Answer": urllib.parse.quote(answer_text),
        "X-AgriMark-Language": detected_lang or "en-IN",
        "Access-Control-Expose-Headers": "X-AgriMark-Transcript, X-AgriMark-Answer, X-AgriMark-Language",
        "Cache-Control": "no-store",
    }

    return Response(content=tts_audio_bytes, media_type="audio/wav", headers=headers)
