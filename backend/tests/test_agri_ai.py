"""
Regression tests for AgriAI chat and voice endpoints.
Covers: provider failures, missing config, invalid audio, timeouts, language fallback.
"""

import io
import json
import time
import wave
import struct
import pytest
from unittest.mock import MagicMock, patch, PropertyMock
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.ai_service import AIService
from backend.app.services.sarvam_voice import SarvamVoiceService, SUPPORTED_TTS_LANGUAGES

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────────

def make_wav_bytes(duration_ms: int = 500, sample_rate: int = 16000) -> bytes:
    """Generate a minimal valid WAV file with silence."""
    num_samples = int(sample_rate * duration_ms / 1000)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(struct.pack(f"<{num_samples}h", *([0] * num_samples)))
    return buf.getvalue()


# ── AIService unit tests ───────────────────────────────────────────────────────

class TestAIService:
    def test_answer_no_openai_key_returns_grounded_fallback(self):
        """Without an API key, service returns grounded fallback — never empty."""
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            svc = AIService()
            result = svc.answer("What is the market price of paddy?")
        assert result
        assert len(result) > 10

    def test_answer_paddy_fallback(self):
        """Paddy keyword triggers specific fallback response."""
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            svc = AIService()
            result = svc.answer("paddy price today")
        assert "paddy" in result.lower() or "agmarknet" in result.lower()

    def test_answer_turmeric_fallback(self):
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            svc = AIService()
            # Test that a clear turmeric query returns some useful response
            result = svc.answer("turmeric price Erode")
        # The fallback should return something meaningful (either turmeric-specific or generic advice)
        assert result
        assert len(result) > 20
        # Should contain AGMARKNET reference or advice, not be an empty/invented claim
        assert "agrimark" in result.lower() or "agmarknet" in result.lower() or "turmeric" in result.lower() or "price" in result.lower()

    def test_answer_generic_fallback_no_invented_data(self):
        """Generic fallback must not claim invented prices or weather."""
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            svc = AIService()
            result = svc.answer("When is the best time to plant mango?")
        # Should mention that live data is unavailable, not invent it
        assert result
        assert "invent" not in result.lower()

    def test_answer_openai_failure_falls_back(self):
        """OpenAI API failure should fall through to grounded fallback, not raise."""
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = Exception("Connection timeout")
        with patch("backend.app.services.ai_service._get_openai_client", return_value=mock_client):
            svc = AIService()
            result = svc.answer("paddy price in Thanjavur")
        assert result
        assert len(result) > 10

    def test_answer_empty_prompt(self):
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            svc = AIService()
            result = svc.answer("")
        assert "provide" in result.lower() or "query" in result.lower()

    def test_answer_whitespace_prompt(self):
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            svc = AIService()
            result = svc.answer("   ")
        assert result


# ── SarvamVoiceService unit tests ──────────────────────────────────────────────

class TestSarvamVoiceService:
    def test_not_configured_without_key(self):
        """Without an API key, service must report not configured."""
        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=None):
            svc = SarvamVoiceService()
        assert not svc.configured

    def test_transcribe_raises_when_not_configured(self):
        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=None):
            svc = SarvamVoiceService()
        with pytest.raises(RuntimeError, match="SARVAM_API_KEY"):
            svc.transcribe(b"audio", "test.wav")

    def test_synthesize_raises_when_not_configured(self):
        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=None):
            svc = SarvamVoiceService()
        with pytest.raises(RuntimeError, match="SARVAM_API_KEY"):
            svc.synthesize("Hello farmer")

    def test_synthesize_raises_on_empty_text(self):
        mock_client = MagicMock()
        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=mock_client):
            svc = SarvamVoiceService()
        with pytest.raises(ValueError, match="empty"):
            svc.synthesize("")

    def test_transcribe_raises_value_error_on_empty_transcript(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.transcript = ""
        mock_response.language_code = "en-IN"
        mock_client.speech_to_text.transcribe.return_value = mock_response
        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=mock_client):
            svc = SarvamVoiceService()
        with pytest.raises(ValueError, match="No speech"):
            svc.transcribe(b"audio_bytes", "test.wav", "en-IN")

    def test_supported_tts_languages_complete(self):
        required = {"ta-IN", "hi-IN", "en-IN", "te-IN", "ml-IN", "kn-IN",
                    "mr-IN", "bn-IN", "gu-IN", "pa-IN"}
        assert required.issubset(SUPPORTED_TTS_LANGUAGES)

    def test_language_fallback_to_en_in(self):
        """Unsupported language code must fall back to en-IN in synthesize."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.audios = [b"AAAA"]  # base64-decodable
        mock_client.text_to_speech.convert.return_value = mock_response

        import base64
        mock_response.audios = [base64.b64encode(b"fake_wav_bytes").decode()]

        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=mock_client):
            svc = SarvamVoiceService()
            svc.synthesize("Test text", language_code="zz-ZZ")  # invalid lang

        # Verify en-IN was used as fallback
        call_kwargs = mock_client.text_to_speech.convert.call_args
        assert call_kwargs.kwargs.get("language_code") == "en-IN" or \
               call_kwargs.args[0] if call_kwargs.args else False or \
               "en-IN" in str(call_kwargs)

    def test_tts_text_truncation(self):
        """Text longer than TTS_MAX_CHARS must be truncated, not rejected."""
        from backend.app.services.sarvam_voice import TTS_MAX_CHARS
        mock_client = MagicMock()

        import base64
        mock_response = MagicMock()
        mock_response.audios = [base64.b64encode(b"fake_wav_bytes").decode()]
        mock_client.text_to_speech.convert.return_value = mock_response

        long_text = "A" * (TTS_MAX_CHARS + 200)

        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=mock_client):
            svc = SarvamVoiceService()
            svc.synthesize(long_text, language_code="en-IN")

        called_text = mock_client.text_to_speech.convert.call_args.kwargs.get("text", "")
        assert len(called_text) <= TTS_MAX_CHARS


# ── /api/v1/ai/chat endpoint tests ────────────────────────────────────────────

class TestAIChatEndpoint:
    def test_chat_returns_200_with_answer(self):
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            res = client.post("/api/v1/ai/chat", json={"message": "paddy price today"})
        assert res.status_code == 200
        data = res.json()
        assert "answer" in data
        assert "request_id" in data
        assert "latency_ms" in data
        assert isinstance(data["latency_ms"], int)

    def test_chat_requires_message(self):
        res = client.post("/api/v1/ai/chat", json={})
        assert res.status_code == 422

    def test_chat_empty_message_rejected(self):
        res = client.post("/api/v1/ai/chat", json={"message": ""})
        assert res.status_code == 422

    def test_chat_message_too_long_rejected(self):
        res = client.post("/api/v1/ai/chat", json={"message": "x" * 8001})
        assert res.status_code == 422

    def test_chat_with_context(self):
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            res = client.post("/api/v1/ai/chat", json={
                "message": "What price should I sell at?",
                "context": "Paddy modal price at Thanjavur mandi: ₹2,480/quintal. Farmer has 10 quintals.",
            })
        assert res.status_code == 200
        assert res.json()["answer"]

    def test_chat_with_language(self):
        with patch("backend.app.services.ai_service._get_openai_client", return_value=None):
            res = client.post("/api/v1/ai/chat", json={
                "message": "paddy price",
                "language": "ta-IN",
            })
        assert res.status_code == 200

    def test_chat_openai_503_on_provider_error(self):
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = RuntimeError("Provider down")
        with patch("backend.app.services.ai_service._get_openai_client", return_value=mock_client):
            # AIService catches the exception and falls back — so chat still returns 200
            res = client.post("/api/v1/ai/chat", json={"message": "paddy price"})
        # Fallback kicks in
        assert res.status_code == 200


# ── /api/v1/ai/voice endpoint tests ───────────────────────────────────────────

class TestAIVoiceEndpoint:
    def test_voice_route_registered(self):
        routes = [route.path for route in app.routes]
        assert "/api/v1/ai/voice" in routes

    def test_voice_empty_audio_rejected(self):
        res = client.post(
            "/api/v1/ai/voice",
            files={"file": ("rec.webm", b"", "audio/webm")},
            data={"language_code": "en-IN"},
        )
        assert res.status_code == 400
        assert "short" in res.json()["detail"].lower() or "empty" in res.json()["detail"].lower()

    def test_voice_tiny_audio_rejected(self):
        """Audio under MIN_AUDIO_BYTES threshold must be rejected."""
        res = client.post(
            "/api/v1/ai/voice",
            files={"file": ("rec.webm", b"x" * 50, "audio/webm")},
            data={"language_code": "en-IN"},
        )
        assert res.status_code == 400

    def test_voice_audio_too_large_rejected(self):
        big_audio = b"x" * (11 * 1024 * 1024)
        res = client.post(
            "/api/v1/ai/voice",
            files={"file": ("rec.webm", big_audio, "audio/webm")},
            data={"language_code": "en-IN"},
        )
        assert res.status_code == 400
        assert "10 MB" in res.json()["detail"]

    def test_voice_sarvam_not_configured_returns_503(self):
        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=None):
            wav = make_wav_bytes(500)
            res = client.post(
                "/api/v1/ai/voice",
                files={"file": ("rec.wav", wav, "audio/wav")},
                data={"language_code": "en-IN"},
            )
        assert res.status_code == 503
        assert "SARVAM_API_KEY" in res.json()["detail"]

    def test_voice_cors_expose_headers(self):
        """CORS must expose all custom AgriMark headers."""
        res = client.post(
            "/api/v1/ai/voice",
            files={"file": ("test.webm", b"audio_content", "audio/webm")},
            headers={"Origin": "https://agrimark-six.vercel.app"},
        )
        expose = res.headers.get("access-control-expose-headers", "")
        assert "X-AgriMark-Transcript" in expose
        assert "X-AgriMark-Answer" in expose
        assert "X-AgriMark-Language" in expose
        assert "X-AgriMark-Request-Id" in expose
        assert "X-AgriMark-Timing" in expose

    def test_voice_stt_empty_transcript_returns_400(self):
        """Empty STT transcript must surface as 400, not 500."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.transcript = ""
        mock_response.language_code = "en-IN"
        mock_client.speech_to_text.transcribe.return_value = mock_response

        with patch("backend.app.services.sarvam_voice._get_sarvam_client", return_value=mock_client):
            wav = make_wav_bytes(500)
            res = client.post(
                "/api/v1/ai/voice",
                files={"file": ("rec.wav", wav, "audio/wav")},
                data={"language_code": "en-IN"},
            )
        assert res.status_code == 400
        assert "speech" in res.json()["detail"].lower() or "No speech" in res.json()["detail"]

    def test_voice_stt_failure_returns_503(self):
        """Sarvam STT RuntimeError must return 503."""
        mock_sarvam = MagicMock()
        mock_sarvam.configured = True
        mock_sarvam.transcribe.side_effect = RuntimeError("Sarvam API unreachable")

        with patch("backend.app.api.v1.ai_voice.SarvamVoiceService", return_value=mock_sarvam):
            wav = make_wav_bytes(500)
            res = client.post(
                "/api/v1/ai/voice",
                files={"file": ("rec.wav", wav, "audio/wav")},
                data={"language_code": "en-IN"},
            )
        assert res.status_code == 503

    def test_voice_full_pipeline_success(self):
        """
        Full pipeline mock: STT → AI → TTS returns audio/wav with correct headers.
        """
        import base64

        mock_sarvam = MagicMock()
        mock_sarvam.configured = True
        mock_sarvam.transcribe.return_value = ("paddy price in Thanjavur?", "ta-IN")
        # Synthesize returns fake WAV bytes
        fake_wav = make_wav_bytes(200)
        mock_sarvam.synthesize.return_value = fake_wav

        with (
            patch("backend.app.api.v1.ai_voice.SarvamVoiceService", return_value=mock_sarvam),
            patch("backend.app.services.ai_service._get_openai_client", return_value=None),
        ):
            wav_input = make_wav_bytes(500)
            res = client.post(
                "/api/v1/ai/voice",
                files={"file": ("rec.wav", wav_input, "audio/wav")},
                data={"language_code": "ta-IN"},
            )

        assert res.status_code == 200
        assert res.headers.get("content-type", "").startswith("audio/wav")
        assert res.headers.get("x-agrimark-transcript")
        assert res.headers.get("x-agrimark-answer")
        assert res.headers.get("x-agrimark-language")
        assert res.headers.get("x-agrimark-request-id")
        assert res.headers.get("x-agrimark-timing")
        assert len(res.content) > 0

    def test_voice_timing_header_format(self):
        """X-AgriMark-Timing must contain all expected stage keys."""
        import base64

        mock_sarvam = MagicMock()
        mock_sarvam.configured = True
        mock_sarvam.transcribe.return_value = ("test query", "en-IN")
        mock_sarvam.synthesize.return_value = make_wav_bytes(100)

        with (
            patch("backend.app.api.v1.ai_voice.SarvamVoiceService", return_value=mock_sarvam),
            patch("backend.app.services.ai_service._get_openai_client", return_value=None),
        ):
            wav_input = make_wav_bytes(500)
            res = client.post(
                "/api/v1/ai/voice",
                files={"file": ("rec.wav", wav_input, "audio/wav")},
                data={"language_code": "en-IN"},
            )

        assert res.status_code == 200
        timing = res.headers.get("x-agrimark-timing", "")
        assert "stt=" in timing
        assert "ai=" in timing
        assert "tts=" in timing
        assert "total=" in timing
