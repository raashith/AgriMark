import pytest
from uuid import UUID

from fastapi.testclient import TestClient

from backend.app.core.auth import AuthenticatedUser, get_current_user
from backend.app.core.config import get_settings
from backend.app.core.database import get_supabase
from backend.app.main import app

client = TestClient(app)


def test_core_crops_requires_database_credentials(monkeypatch):
    get_settings.cache_clear()
    get_supabase.cache_clear()
    monkeypatch.setenv("SUPABASE_URL", "")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "")
    monkeypatch.setenv("SUPABASE_PUBLISHABLE_KEY", "")
    try:
        with pytest.raises(RuntimeError, match="No Supabase server credential configured"):
            client.get("/api/v1/core/crops")
    finally:
        get_settings.cache_clear()
        get_supabase.cache_clear()




def test_core_validation_rejects_negative_farm_area():
    user_id = UUID("00000000-0000-0000-0000-000000000000")
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            f"/api/v1/core/profiles/{user_id}/farms",
            headers={"Authorization": "Bearer fake_token"},
            json={"name": "Test", "area_acres": -1},
        )
        assert response.status_code == 422
    finally:
        app.dependency_overrides.clear()




def test_create_farm_returns_saved_database_row(monkeypatch):
    from types import SimpleNamespace
    from backend.app.api.v1 import core

    user_id = UUID("00000000-0000-0000-0000-000000000123")
    farm_id = UUID("00000000-0000-0000-0000-000000000456")
    inserted = {}

    class FakeInsert:
        def insert(self, payload):
            inserted.update(payload)
            return self

        def select(self, columns):
            assert columns == "*"
            return self

        def execute(self):
            return SimpleNamespace(data=[{
                "id": str(farm_id),
                "owner_id": str(user_id),
                "name": inserted["name"],
                "village": inserted["village"],
                "district": inserted["district"],
                "state": inserted["state"],
                "area_acres": inserted["area_acres"],
                "soil_type": inserted["soil_type"],
                "irrigation_source": inserted["irrigation_source"],
            }])

    class FakeDatabase:
        def table(self, name):
            assert name == "farms"
            return FakeInsert()

    monkeypatch.setattr(core, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            f"/api/v1/core/profiles/{user_id}/farms",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "name": "Test Farm",
                "village": "Devapandalam",
                "district": "Kallakurichi",
                "state": "Tamil Nadu",
                "area_acres": 1.2,
                "soil_type": "Black Cotton Soil",
                "irrigation_source": "Borewell",
            },
        )
        assert response.status_code == 201
        assert response.json()["id"] == str(farm_id)
        assert inserted["owner_id"] == str(user_id)
        assert response.json()["area_acres"] == "1.2"
    finally:
        app.dependency_overrides.clear()



def test_create_farmer_cultivation_persists_owned_farm_crop_and_profile(monkeypatch):
    from datetime import datetime, timezone
    from types import SimpleNamespace
    from backend.app.api.v1 import core

    user_id = UUID("00000000-0000-0000-0000-000000000123")
    farm_id = UUID("00000000-0000-0000-0000-000000000456")
    crop_id = UUID("00000000-0000-0000-0000-000000000789")
    cultivation_id = UUID("00000000-0000-0000-0000-000000000abc")
    inserted = {}

    class FakeQuery:
        def __init__(self, table_name):
            self.table_name = table_name

        def select(self, _columns):
            return self

        def eq(self, *_args):
            return self

        def limit(self, _limit):
            return self

        def order(self, *_args, **_kwargs):
            return self

        def insert(self, payload):
            inserted.update(payload)
            return self

        def execute(self):
            if self.table_name == "farms":
                return SimpleNamespace(data=[{"id": str(farm_id), "area_acres": 2.0}])
            if self.table_name == "crops":
                return SimpleNamespace(data=[{"id": str(crop_id), "name": "Paddy"}])
            if self.table_name == "farmer_cultivation_records":
                return SimpleNamespace(data=[{
                    **inserted,
                    "id": str(cultivation_id),
                    "created_at": datetime(2026, 10, 17, tzinfo=timezone.utc).isoformat(),
                    "crops": {"name": "Paddy"},
                }])
            raise AssertionError(f"Unexpected table: {self.table_name}")

    class FakeDatabase:
        def table(self, name):
            return FakeQuery(name)

    monkeypatch.setattr(core, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            "/api/v1/core/farmer-cultivations",
            headers={"Authorization": "Bearer fake_token"},
            json={
                "farm_id": str(farm_id),
                "crop_id": str(crop_id),
                "variety": "IR64",
                "season": "Kharif",
                "area_acres": 1.25,
                "expected_yield_kg": 2200,
                "status": "planned",
            },
        )
        assert response.status_code == 201, response.text
        body = response.json()
        assert body["id"] == str(cultivation_id)
        assert body["farmer_id"] == str(user_id)
        assert body["crop_name"] == "Paddy"
        assert body["area_acres"] == "1.25"
        assert inserted["farmer_id"] == str(user_id)
        assert inserted["farm_id"] == str(farm_id)
        assert inserted["crop_id"] == str(crop_id)
    finally:
        app.dependency_overrides.clear()


def test_upload_farmer_document_persists_private_object_and_metadata(monkeypatch):
    from datetime import datetime, timezone
    from types import SimpleNamespace
    from backend.app.api.v1 import core

    user_id = UUID("00000000-0000-0000-0000-000000000123")
    farm_id = UUID("00000000-0000-0000-0000-000000000456")
    document_id = UUID("00000000-0000-0000-0000-000000000ddd")
    uploaded = {}
    inserted = {}

    class FakeQuery:
        def __init__(self, table_name):
            self.table_name = table_name

        def select(self, _columns):
            return self

        def eq(self, *_args):
            return self

        def limit(self, _limit):
            return self

        def order(self, *_args, **_kwargs):
            return self

        def insert(self, payload):
            inserted.update(payload)
            return self

        def execute(self):
            if self.table_name == "farms":
                return SimpleNamespace(data=[{"id": str(farm_id)}])
            if self.table_name == "farmer_documents":
                return SimpleNamespace(data=[{
                    **inserted,
                    "id": str(document_id),
                    "created_at": datetime(2026, 10, 17, tzinfo=timezone.utc).isoformat(),
                }])
            raise AssertionError(f"Unexpected table: {self.table_name}")

    class FakeStorageBucket:
        def upload(self, path, contents, options):
            uploaded["path"] = path
            uploaded["contents"] = contents
            uploaded["options"] = options
            return {"path": path}

        def remove(self, paths):
            uploaded["removed"] = paths
            return {"data": []}

    class FakeStorage:
        def from_(self, bucket_name):
            assert bucket_name == "farmer-documents"
            return FakeStorageBucket()

    class FakeDatabase:
        storage = FakeStorage()

        def table(self, name):
            return FakeQuery(name)

    monkeypatch.setattr(core, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            "/api/v1/core/documents",
            headers={"Authorization": "Bearer fake_token"},
            data={
                "doc_type": "Land Record (Patta/Chitta)",
                "doc_number": "PATTA-123",
                "issuing_authority": "Revenue Department",
                "farm_id": str(farm_id),
            },
            files={"file": ("patta.pdf", b"%PDF-1.7\nprivate test document", "application/pdf")},
        )
        assert response.status_code == 201, response.text
        body = response.json()
        assert body["id"] == str(document_id)
        assert body["user_id"] == str(user_id)
        assert body["farm_id"] == str(farm_id)
        assert body["file_path"] == uploaded["path"]
        assert body["file_name"] == "patta.pdf"
        assert body["is_private"] is True
        assert uploaded["path"].startswith(f"{user_id}/")
        assert uploaded["options"]["content-type"] == "application/pdf"
        assert inserted["user_id"] == str(user_id)
        assert inserted["file_size_bytes"] == len(b"%PDF-1.7\nprivate test document")
    finally:
        app.dependency_overrides.clear()


def test_upload_farmer_document_rejects_mismatched_file_signature(monkeypatch):
    from backend.app.api.v1 import core

    user_id = UUID("00000000-0000-0000-0000-000000000123")
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.post(
            "/api/v1/core/documents",
            headers={"Authorization": "Bearer fake_token"},
            data={"doc_type": "Land Record (Patta/Chitta)", "doc_number": "PATTA-123"},
            files={"file": ("patta.pdf", b"not really a PDF", "application/pdf")},
        )
        assert response.status_code == 415
        assert "contents do not match" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()



def test_produce_lot_management_requires_authentication():
    from uuid import uuid4

    lot_id = uuid4()
    assert client.get("/api/v1/core/produce-lots").status_code == 401
    assert client.post(
        "/api/v1/core/produce-lots",
        json={"crop_id": str(uuid4()), "quantity": 10, "unit": "kg"},
    ).status_code == 401
    assert client.patch(
        f"/api/v1/core/produce-lots/{lot_id}",
        json={"quantity": 20},
    ).status_code == 401
    assert client.delete(f"/api/v1/core/produce-lots/{lot_id}").status_code == 401



def test_produce_lot_resolves_crop_name_when_embedded_relation_missing(monkeypatch):
    from types import SimpleNamespace
    from backend.app.api.v1 import core

    user_id = UUID("00000000-0000-0000-0000-000000000123")
    crop_id = UUID("00000000-0000-0000-0000-000000000789")
    lot_id = UUID("00000000-0000-0000-0000-000000000abc")
    calls = []

    class FakeQuery:
        def __init__(self, table_name):
            self.table_name = table_name

        def select(self, _columns):
            return self

        def eq(self, *_args):
            return self

        def order(self, *_args, **_kwargs):
            return self

        def limit(self, _limit):
            return self

        def execute(self):
            calls.append(self.table_name)
            if self.table_name == "produce_lots":
                return SimpleNamespace(data=[{
                    "id": str(lot_id),
                    "owner_id": str(user_id),
                    "crop_id": str(crop_id),
                    "cultivation_id": None,
                    "quantity": "10",
                    "unit": "kg",
                    "quality_grade": "Grade A",
                    "available_quantity": "10",
                    "harvested_at": "2026-10-16",
                    "status": "available",
                    "crops": None,
                }])
            if self.table_name == "crops":
                return SimpleNamespace(data=[{"name": "Paddy"}])
            raise AssertionError(f"Unexpected table: {self.table_name}")

    class FakeDatabase:
        def table(self, name):
            return FakeQuery(name)

    monkeypatch.setattr(core, "get_supabase", lambda: FakeDatabase())
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(id=user_id, role="farmer")
    try:
        response = client.get("/api/v1/core/produce-lots", headers={"Authorization": "Bearer fake_token"})
        assert response.status_code == 200, response.text
        assert response.json()[0]["crop_name"] == "Paddy"
        assert "crops" in calls
    finally:
        app.dependency_overrides.clear()
