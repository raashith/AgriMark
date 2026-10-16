import time
import uuid
import logging
import asyncio
from functools import partial

import urllib.parse
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

MAX_AUDIO_BYTES = 10 * 1024 * 1024  # 10 MB
MIN_AUDIO_BYTES = 1000  # ~1 KB minimum — anything less is almost certainly silence/padding


@router.post("/voice")
async def voice_assistant(
    file: UploadFile = File(...),
    language_code: str = Form("unknown"),
) -> Response:
    """
    AgriMark AI Voice Assistant
    Browser audio → Sarvam Saaras v3 STT → AgriMark AIService → Sarvam Bulbul v3 TTS → audio response.

    Custom response headers (percent-encoded for Unicode safety):
      X-AgriMark-Transcript  — recognised speech text
      X-AgriMark-Answer      — AI answer text
      X-AgriMark-Language    — detected language code
      X-AgriMark-Request-Id  — request trace ID for debugging
      X-AgriMark-Timing      — JSON timing breakdown (ms)
    """
    request_id = str(uuid.uuid4())[:12]
    t_start = time.monotonic()
    timings: dict = {}

    # ── Read & validate audio ──────────────────────────────────────────────────
    audio_bytes = await file.read()

    if not audio_bytes or len(audio_bytes) < MIN_AUDIO_BYTES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Audio recording is too short or empty. "
                "Please speak clearly into your microphone for at least one second."
            ),
        )

    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Audio recording exceeds the 10 MB limit. Please keep recordings under 30 seconds.",
        )

    logger.info(
        "[%s] Voice request: lang=%s size=%d bytes content_type=%s",
        request_id, language_code, len(audio_bytes), file.content_type,
    )

    # ── Validate Sarvam service config ─────────────────────────────────────────
    voice_service = SarvamVoiceService()
    if not voice_service.configured:
        raise HTTPException(
            status_code=503,
            detail="SARVAM_API_KEY is not configured on the AgriMark server.",
        )

    filename = file.filename or "recording.webm"
    target_lang = (language_code or "unknown").strip()

    # ── Step 1: Speech-to-Text (run in thread pool — sync SDK call) ────────────
    t1 = time.monotonic()
    loop = asyncio.get_running_loop()
    try:
        transcript, detected_lang = await loop.run_in_executor(
            None,
            partial(
                voice_service.transcribe,
                audio_bytes=audio_bytes,
                filename=filename,
                language_code=target_lang,
                request_id=request_id,
            ),
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err)) from val_err
    except RuntimeError as run_err:
        raise HTTPException(status_code=503, detail=str(run_err)) from run_err
    except Exception as exc:
        logger.error("[%s] STT unexpected error: %s", request_id, exc)
        raise HTTPException(status_code=500, detail="Failed to process speech input.") from exc
    finally:
        timings["stt_ms"] = round((time.monotonic() - t1) * 1000)

    logger.info("[%s] STT transcript: %r (lang=%s)", request_id, transcript[:80], detected_lang)

    # ── Step 2: AI Agricultural Decision Engine (run in thread pool) ──────────
    t2 = time.monotonic()
    ai_service = AIService()

    # Build an agriculturally-grounded system prompt for the AI
    system_prompt = (
        "You are AgriMark AI, a multilingual agricultural decision-support assistant for Indian farmers. "
        "Respond in the same language as the user's question. "
        "For market price questions, clearly state that prices are indicative AGMARKNET reference rates "
        "and advise the user to check current AGMARKNET rates before trading. "
        "Never invent live prices, weather, disease diagnoses, or farm-specific records. "
        "Keep your answer concise (under 3 sentences) for voice delivery. "
        f"User's language: {detected_lang}.\n\nUser: {transcript}"
    )

    try:
        answer_text = await loop.run_in_executor(
            None,
            partial(ai_service.answer, system_prompt, request_id),
        )
    except Exception as exc:
        logger.error("[%s] AIService error: %s", request_id, exc)
        # Do NOT silently return invented data — propagate a useful error
        raise HTTPException(
            status_code=503,
            detail="AgriMark AI is temporarily unavailable. Please try again or use text chat.",
        ) from exc
    finally:
        timings["ai_ms"] = round((time.monotonic() - t2) * 1000)

    logger.info("[%s] AI answer: %r", request_id, answer_text[:80])

    # ── Step 3: Text-to-Speech (run in thread pool) ────────────────────────────
    t3 = time.monotonic()
    try:
        tts_audio_bytes = await loop.run_in_executor(
            None,
            partial(
                voice_service.synthesize,
                text=answer_text,
                language_code=detected_lang,
                request_id=request_id,
            ),
        )
    except Exception as exc:
        logger.error("[%s] TTS error: %s", request_id, exc)
        raise HTTPException(status_code=503, detail="Failed to synthesize audio response.") from exc
    finally:
        timings["tts_ms"] = round((time.monotonic() - t3) * 1000)

    timings["total_ms"] = round((time.monotonic() - t_start) * 1000)
    logger.info(
        "[%s] Voice pipeline complete: stt=%dms ai=%dms tts=%dms total=%dms",
        request_id, timings.get("stt_ms", 0), timings.get("ai_ms", 0),
        timings.get("tts_ms", 0), timings.get("total_ms", 0),
    )

    # ── Build response headers (percent-encoded for Unicode safety) ───────────
    headers = {
        "X-AgriMark-Transcript": urllib.parse.quote(transcript),
        "X-AgriMark-Answer": urllib.parse.quote(answer_text),
        "X-AgriMark-Language": detected_lang or "en-IN",
        "X-AgriMark-Request-Id": request_id,
        "X-AgriMark-Timing": (
            f"stt={timings.get('stt_ms',0)}ms,"
            f"ai={timings.get('ai_ms',0)}ms,"
            f"tts={timings.get('tts_ms',0)}ms,"
            f"total={timings.get('total_ms',0)}ms"
        ),
        "Access-Control-Expose-Headers": (
            "X-AgriMark-Transcript, X-AgriMark-Answer, X-AgriMark-Language, "
            "X-AgriMark-Request-Id, X-AgriMark-Timing"
        ),
    }

    return Response(
        content=tts_audio_bytes,
        media_type="audio/wav",
        headers=headers,
    )
