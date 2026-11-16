from types import SimpleNamespace
from uuid import UUID

from fastapi.testclient import TestClient

from backend.app.api.v1 import admin
from backend.app.core.auth import AuthenticatedUser, get_current_user
from backend.app.main import app

client = TestClient(app)


def test_admin_dashboard_summary_requires_authentication():
    response = client.get("/api/v1/admin/dashboard-summary")
    assert response.status_code == 401


def test_admin_dashboard_summary_rejects_non_admin_users():
    user_id = UUID("00000000-0000-0000-0000-000000000123")
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.get(
            "/api/v1/admin/dashboard-summary",
            headers={"Authorization": "Bearer test-token"},
        )
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_admin_dashboard_summary_uses_canonical_marketplace_schema(monkeypatch):
    admin_id = UUID("00000000-0000-0000-0000-000000000123")
    farmer_id = UUID("00000000-0000-0000-0000-000000000456")
    rows = {
        "profiles": [
            {"id": str(farmer_id), "full_name": "Farmer One", "phone": "9000000001", "role": "farmer", "created_at": "2026-11-01"},
            {"id": str(admin_id), "full_name": "Admin One", "phone": "9000000002", "role": "admin", "created_at": "2026-11-02"},
            {"id": "00000000-0000-0000-0000-000000000789", "full_name": "Buyer One", "phone": "9000000003", "role": "buyer", "created_at": "2026-11-03"},
        ],
        "listings": [
            {"id": "listing-1", "price_per_unit": "20", "status": "active"},
            {"id": "listing-2", "price_per_unit": "25", "status": "active"},
        ],
        "marketplace_orders": [
            {"id": "order-1", "total_price": "100.00", "status": "placed"},
            {"id": "order-2", "total_price": "200.00", "status": "delivered"},
            {"id": "order-3", "total_price": "50.00", "status": "cancelled"},
        ],
        "farms": [
            {"id": "farm-1", "area_acres": "1.5"},
            {"id": "farm-2", "area_acres": "3.0"},
        ],
        "produce_lots": [
            {"id": "lot-1", "available_quantity": "10"},
            {"id": "lot-2", "available_quantity": "5"},
        ],
        "farmer_documents": [
            {"user_id": str(farmer_id), "verification_status": "verified"},
        ],
    }
    filters = {
        "listings": {"status": "active"},
    }

    class FakeQuery:
        def __init__(self, table_name):
            self.table_name = table_name
            self.selected = None
            self.equals = {}
            self.start = 0
            self.end = 999

        def select(self, columns):
            self.selected = columns
            return self

        def eq(self, column, value):
            self.equals[column] = value
            return self

        def order(self, *_args, **_kwargs):
            return self

        def range(self, start, end):
            self.start = start
            self.end = end
            return self

        def execute(self):
            table_rows = rows[self.table_name]
            selected = [
                row for row in table_rows
                if all(row.get(key) == value for key, value in self.equals.items())
            ]
            return SimpleNamespace(data=selected[self.start:self.end + 1])

    class FakeDatabase:
        def table(self, table_name):
            assert table_name in rows, f"Unexpected table queried: {table_name}"
            return FakeQuery(table_name)

    monkeypatch.setattr(admin, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=admin_id, role="admin")
    try:
        response = client.get(
            "/api/v1/admin/dashboard-summary",
            headers={"Authorization": "Bearer test-token"},
        )
        assert response.status_code == 200, response.text
        body = response.json()
        assert body["summary"] == {
            "registered_users": 3,
            "farmer_accounts": 1,
            "verified_farmers": 1,
            "active_listings": 2,
            "total_orders": 3,
            "active_orders": 1,
            "completed_orders": 1,
            "order_volume_inr": 300.0,
            "total_farms": 2,
            "total_farm_acres": 4.5,
            "total_available_stock_kg": 15.0,
            "average_asking_price_per_unit": 22.5,
        }
        assert body["users"][0]["document_status"] == "verified"
        assert "email" not in body["users"][0]
    finally:
        app.dependency_overrides.clear()
