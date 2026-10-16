from backend.app.api.v1 import ai_chat
from backend.app.services import market_data


def test_market_context_is_built_from_production_agmarknet(monkeypatch):
    dimensions = {
        "commodities": [{"code": "PADDY", "name": "Paddy"}],
        "states": [{"state_code": "IN-TN", "state_name": "Tamil Nadu"}],
        "districts": [{"district_code": "TN-THANJAVUR", "district_name": "Thanjavur", "state_code": "IN-TN"}],
        "mandis": [{"mandi_code": "THANJAVUR", "mandi_name": "Thanjavur Market", "district_code": "TN-THANJAVUR", "state_code": "IN-TN"}],
    }
    monkeypatch.setattr(market_data, "_market_dimensions", lambda: dimensions)
    captured = {}

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return [{
                "id": 1,
                "commodity_code": "PADDY",
                "variety": "Common",
                "grade": None,
                "mandi_code": "THANJAVUR",
                "district_code": "TN-THANJAVUR",
                "state_code": "IN-TN",
                "min_price": 2100,
                "max_price": 2400,
                "modal_price": 2250,
                "observation_date": "2026-10-16",
                "source": "AGMARKNET",
            }]

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def get(self, url, params=None):
            captured["url"] = url
            captured["params"] = params
            return FakeResponse()

    monkeypatch.setattr(market_data.httpx, "Client", FakeClient)
    context = market_data.build_market_context(
        "today mandi price for paddy in Thanjavur Tamil Nadu",
        commodity_aliases={"paddy": "PADDY"},
        state_codes={"tamil nadu": "TN"},
    )

    assert "AGMARKNET OFFICIAL MARKET CONTEXT" in context
    assert "modal=₹2250" in context
    assert "Thanjavur Market, Thanjavur, Tamil Nadu" in context
    assert captured["params"]["commodity_code"] == "eq.PADDY"
    assert captured["params"]["state_code"] == "eq.IN-TN"
    assert captured["params"]["district_code"] == "eq.TN-THANJAVUR"


def test_market_context_does_not_substitute_an_unmatched_price(monkeypatch):
    dimensions = {
        "commodities": [{"code": "PADDY", "name": "Paddy"}],
        "states": [{"state_code": "IN-TN", "state_name": "Tamil Nadu"}],
        "districts": [],
        "mandis": [],
    }
    monkeypatch.setattr(market_data, "_market_dimensions", lambda: dimensions)

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return []

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def get(self, *_args, **_kwargs):
            return FakeResponse()

    monkeypatch.setattr(market_data.httpx, "Client", FakeClient)
    context = market_data.build_market_context(
        "mandi price for paddy in Tamil Nadu",
        commodity_aliases={"paddy": "PADDY"},
        state_codes={"tamil nadu": "TN"},
    )

    assert "No matching official market observation was found" in context
    assert "Do not invent a price" in context


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
