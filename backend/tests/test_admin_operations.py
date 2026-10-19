import pytest
from uuid import UUID
from types import SimpleNamespace

from fastapi.testclient import TestClient

from backend.app.api.v1 import admin
from backend.app.core.auth import AuthenticatedUser, get_current_user
from backend.app.main import app

client = TestClient(app)


def test_admin_operations_overview_rejects_non_admin():
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        id=UUID("00000000-0000-0000-0000-000000000123"),
        role="farmer",
    )
    try:
        response = client.get(
            "/api/v1/admin/operations/overview",
            headers={"Authorization": "Bearer fake_token"},
        )
        assert response.status_code == 403
        assert response.json()["detail"] == "Administrator access required"
    finally:
        app.dependency_overrides.clear()


def test_admin_operations_overview_returns_database_metrics(monkeypatch):
    class FakeQuery:
        def __init__(self, table_name):
            self.table_name = table_name
            self.columns = "*"
            self.filters = {}
            self.head = False

        def select(self, columns, **kwargs):
            self.columns = columns
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
                counts = {
                    ("profiles", None): 10,
                    ("profiles", "farmer"): 7,
                    ("listings", "active"): 4,
                    ("marketplace_orders", None): 3,
                }
                return SimpleNamespace(data=None, count=counts.get((self.table_name, self.filters.get("role") or self.filters.get("status")), 0), error=None)
            rows = {
                "listings": [{"id": "listing-1", "title": "Onion", "status": "active", "created_at": "2026-10-18T08:00:00Z"}],
                "marketplace_orders": [{"id": "order-1", "status": "pending", "created_at": "2026-10-18T08:10:00Z"}],
                "admin_audit_log": [{"id": "audit-1", "action": "MARKETPLACE_ORDER_CREATED", "created_at": "2026-10-18T08:10:00Z"}],
                "national_market_price_observations": [{"observation_date": "2026-10-16"}],
            }
            return SimpleNamespace(data=rows.get(self.table_name, []), count=len(rows.get(self.table_name, [])), error=None)

    class FakeDatabase:
        def table(self, table_name):
            return FakeQuery(table_name)

    monkeypatch.setattr(admin, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        id=UUID("00000000-0000-0000-0000-000000000456"),
        role="admin",
    )
    try:
        response = client.get(
            "/api/v1/admin/operations/overview",
            headers={"Authorization": "Bearer fake_token"},
        )
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["metrics"] == {"users": 10, "farmers": 7, "active_listings": 4, "orders": 3}
        assert body["recent_orders"][0]["id"] == "order-1"
        assert body["audit_events"][0]["action"] == "MARKETPLACE_ORDER_CREATED"
        assert body["latest_market_date"] == "2026-10-16"
        assert body["source_errors"] == []
    finally:
        app.dependency_overrides.clear()
