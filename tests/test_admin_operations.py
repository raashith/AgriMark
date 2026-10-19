from types import SimpleNamespace
from uuid import UUID

from fastapi.testclient import TestClient

from backend.app.api.v1 import admin
from backend.app.core.auth import AuthenticatedUser, get_current_user
from backend.app.main import app

client = TestClient(app)


def test_admin_overview_denies_non_admin():
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        id=UUID("00000000-0000-0000-0000-000000000123"),
        role="farmer",
    )
    try:
        response = client.get("/api/v1/admin/operations/overview", headers={"Authorization": "Bearer test"})
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_admin_overview_uses_real_source_results(monkeypatch):
    class Query:
        def __init__(self, table):
            self.table = table
            self.filters = {}
            self.head = False

        def select(self, _columns, **kwargs):
            self.head = bool(kwargs.get("head"))
            return self

        def eq(self, key, value):
            self.filters[key] = value
            return self

        def order(self, *_args, **_kwargs):
            return self

        def limit(self, _limit):
            return self

        def execute(self):
            if self.head:
                key = self.filters.get("role") or self.filters.get("status")
                count = {
                    ("profiles", None): 4,
                    ("profiles", "farmer"): 2,
                    ("listings", "active"): 3,
                    ("marketplace_orders", None): 1,
                }.get((self.table, key), 0)
                return SimpleNamespace(data=None, count=count, error=None)
            rows = {
                "listings": [{"id": "listing-1", "title": "Onion", "status": "active", "created_at": "2026-10-18T08:00:00Z"}],
                "marketplace_orders": [{"id": "order-1", "status": "pending", "created_at": "2026-10-18T08:01:00Z"}],
                "admin_audit_log": [{"id": "event-1", "action": "ORDER_CREATED", "created_at": "2026-10-18T08:01:00Z"}],
                "national_market_price_observations": [{"observation_date": "2026-10-16"}],
            }
            return SimpleNamespace(data=rows.get(self.table, []), count=1, error=None)

    class Database:
        def table(self, table):
            return Query(table)

    monkeypatch.setattr(admin, "get_supabase", lambda: Database())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        id=UUID("00000000-0000-0000-0000-000000000456"),
        role="admin",
    )
    try:
        response = client.get("/api/v1/admin/operations/overview", headers={"Authorization": "Bearer test"})
        assert response.status_code == 200
        body = response.json()
        assert body["metrics"] == {"users": 4, "farmers": 2, "active_listings": 3, "orders": 1}
        assert body["recent_orders"][0]["id"] == "order-1"
        assert body["source_errors"] == []
    finally:
        app.dependency_overrides.clear()


def test_farmer_cannot_place_marketplace_order(monkeypatch):
    user = AuthenticatedUser(
        id=UUID("00000000-0000-0000-0000-000000000123"),
        role="farmer",
    )
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        response = client.post(
            "/api/v1/marketplace/orders",
            headers={"Authorization": "Bearer test"},
            json={"listing_id": "00000000-0000-0000-0000-000000000456", "quantity": 5, "unit": "kg"},
        )
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()
