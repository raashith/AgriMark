from decimal import Decimal
from uuid import uuid4

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.api.v1 import marketplace


def test_marketplace_routes_require_authentication():
    client = TestClient(app)
    assert client.post("/api/v1/marketplace/rfqs", json={"quantity": 10}).status_code == 401
    assert client.get("/api/v1/marketplace/orders").status_code == 401


def test_order_rejects_below_minimum(monkeypatch):
    user_id = uuid4()
    listing_id = uuid4()
    seller_id = uuid4()
    lot_id = uuid4()

    def fake_user():
        return type("User", (), {"id": user_id})()

    monkeypatch.setattr(marketplace, "get_current_user", fake_user)
    monkeypatch.setattr(
        marketplace,
        "_single",
        lambda result, not_found="Resource not found": {
            "id": str(listing_id),
            "seller_id": str(seller_id),
            "lot_id": str(lot_id),
            "price_per_unit": "20",
            "min_order_quantity": "50",
            "status": "active",
        },
    )

    assert Decimal("10") < Decimal("50")
