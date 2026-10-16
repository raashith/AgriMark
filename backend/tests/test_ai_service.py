from types import SimpleNamespace

from backend.app.services import ai_service


def test_missing_key_reports_render_configuration_step(monkeypatch):
    monkeypatch.setattr(
        ai_service,
        "get_settings",
        lambda: SimpleNamespace(openai_api_key=None),
    )
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    service = ai_service.AIService()

    assert not service.configured
    try:
        service.answer("hi")
    except RuntimeError as exc:
        assert "OPENAI_API_KEY" in str(exc)
        assert "Render" in str(exc)
    else:
        raise AssertionError("Expected missing API key to fail clearly")


def test_answer_uses_configured_model_and_returns_text(monkeypatch):
    monkeypatch.setattr(
        ai_service,
        "get_settings",
        lambda: SimpleNamespace(openai_api_key="test-key"),
    )
    captured = {}

    class FakeResponses:
        def create(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(output_text="Namaste! How can I help with your farm?")

    class FakeClient:
        def __init__(self, **kwargs):
            captured["client_options"] = kwargs
            self.responses = FakeResponses()

    monkeypatch.setattr(ai_service, "OpenAI", FakeClient)
    service = ai_service.AIService()

    assert service.answer("hi").startswith("Namaste!")
    assert captured["model"] == "gpt-5-mini"
    assert captured["input"] == "hi"
    assert captured["client_options"]["timeout"] == 25.0
    assert captured["client_options"]["max_retries"] == 1


def test_empty_prompt_is_rejected(monkeypatch):
    monkeypatch.setattr(
        ai_service,
        "get_settings",
        lambda: SimpleNamespace(openai_api_key="test-key"),
    )

    class FakeClient:
        def __init__(self, **_kwargs):
            self.responses = None

    monkeypatch.setattr(ai_service, "OpenAI", FakeClient)
    service = ai_service.AIService()

    try:
        service.answer("   ")
    except ValueError as exc:
        assert "agricultural query" in str(exc)
    else:
        raise AssertionError("Expected empty prompt to be rejected")
