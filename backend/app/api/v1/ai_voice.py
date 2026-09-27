from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from ...services.ai_service import AIService
from ...services.sarvam_voice import SarvamVoiceService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/voice")
async def voice(
    file: UploadFile = File(...),
    language_code: str = Form("en-IN"),
    context: str | None = Form(default=None),
):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=415, detail="Audio file required")

    audio = await file.read()
    if not audio:
        raise HTTPException(status_code=400, detail="Audio file is empty")
    if len(audio) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file is too large")

    try:
        sarvam = SarvamVoiceService()
        transcript = sarvam.transcribe(
            audio,
            file.filename or "recording.webm",
            language_code,
        )

        prompt = (
            "You are AgriMark AI, an agricultural decision-support assistant. "
            "Do not invent live weather, prices, GPS, farm records, or transactions. "
            "State uncertainty when current data is unavailable. Keep spoken answers "
            "clear, natural, and concise for a farmer.\n\n"
        )
        if context:
            prompt += f"Context:\n{context}\n\n"
        prompt += f"Farmer said:\n{transcript}"

        answer = AIService().answer(prompt)
        audio_bytes = sarvam.synthesize(answer, language_code)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={
            "X-AgriMark-Transcript": transcript,
            "X-AgriMark-Answer": answer,
        },
    )
