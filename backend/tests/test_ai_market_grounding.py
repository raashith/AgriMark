from backend.app.api.v1 import ai_chat


def test_market_context_is_built_from_agmarknet(monkeypatch):
    class FakeQuery:
        def __init__(self):
            self.filters = []

        def select(self, *_args, **_kwargs):
            return self

        def eq(self, key, value):
            self.filters.append((key, value))
            return self

        def order(self, *_args, **_kwargs):
            return self

        def limit(self, *_args, **_kwargs):
            return self

        def execute(self):
            return type(
                "Result",
                (),
                {
                    "data": [
                        {
                            "commodity_code": "PADDY",
                            "variant_code": "PADDY_COMMON",
                            "mandi_code": "TN_THANJAVUR_MARKET",
                            "district_code": "TN_THANJAVUR",
                            "state_code": "TN",
                            "min_price": 2100,
                            "max_price": 2400,
                            "modal_price": 2250,
                            "observed_at": "2026-10-05T06:00:00Z",
                            "source": "AGMARKNET_DAILY",
                            "geography": "Thanjavur, Tamil Nadu",
                            "unit": "INR_PER_QUINTAL",
                        }
                    ]
                },
            )()

    class FakeClient:
        def table(self, *_args, **_kwargs):
            return FakeQuery()

    monkeypatch.setattr(ai_chat, "get_supabase", lambda: FakeClient())
    context = ai_chat.get_market_context("today mandi price for paddy in Tamil Nadu")

    assert "AGMARKNET OFFICIAL MARKET CONTEXT" in context
    assert "modal=₹2250" in context
    assert "Thanjavur, Tamil Nadu" in context


def test_market_question_uses_database_context(monkeypatch):
    captured = {}

    monkeypatch.setattr(
        ai_chat,
        "get_market_context",
        lambda _message: "AGMARKNET OFFICIAL MARKET CONTEXT\nmodal=₹2250",
    )

    class FakeAI:
        def answer(self, prompt):
            captured["prompt"] = prompt
            return "The stored AGMARKNET modal price is ₹2,250 per quintal."

    monkeypatch.setattr(ai_chat, "AIService", FakeAI)

    response = ai_chat.chat(ai_chat.AIChatRequest(message="What is paddy mandi price in Tamil Nadu?"))

    assert response.status == "ok"
    assert "AGMARKNET OFFICIAL MARKET CONTEXT" in captured["prompt"]
    assert "Do not invent a price" in captured["prompt"]
