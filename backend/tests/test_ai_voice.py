from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.sarvam_voice import SarvamVoiceService, SUPPORTED_TTS_LANGUAGES

client = TestClient(app)


def test_ai_voice_route_registered():
    routes = [route.path for route in app.routes]
    assert "/api/v1/ai/voice" in routes


def test_ai_voice_cors_expose_headers():
    response = client.post(
        "/api/v1/ai/voice",
        files={"file": ("test.webm", b"audio_content", "audio/webm")},
        headers={"Origin": "https://agrimark-six.vercel.app"},
    )
    expose = response.headers.get("access-control-expose-headers", "")
    assert "X-AgriMark-Transcript" in expose
    assert "X-AgriMark-Answer" in expose
    assert "X-AgriMark-Language" in expose


def test_ai_voice_empty_file_rejection():
    response = client.post(
        "/api/v1/ai/voice",
        files={"file": ("test.webm", b"", "audio/webm")},
        data={"language_code": "unknown"},
    )
    assert response.status_code == 400
    assert "Empty audio recording" in response.json().get("detail", "")


def test_sarvam_voice_language_fallback():
    svc = SarvamVoiceService()
    # Test supported TTS languages list
    assert "ta-IN" in SUPPORTED_TTS_LANGUAGES
    assert "hi-IN" in SUPPORTED_TTS_LANGUAGES
    assert "en-IN" in SUPPORTED_TTS_LANGUAGES
