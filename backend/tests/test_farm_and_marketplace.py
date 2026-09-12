import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def auth_headers():
    phone = "9876543210"
    client.post("/api/v1/auth/register", json={
        "phone": phone,
        "password": "securepassword123",
        "full_name": "Test Farmer User",
        "role_name": "FARMER"
    })
    res = client.post("/api/v1/auth/login", json={
        "phone_or_email": phone,
        "password": "securepassword123"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_farm_and_crop_lifecycle(auth_headers):
    # 1. Create Farm
    farm_res = client.post("/api/v1/farms", json={
        "name": "Green Acres Farm",
        "location_name": "Coimbatore, Tamil Nadu",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "total_area_acres": 5.5,
        "soil_type": "RED_LOAM",
        "irrigation_source": "BOREWELL"
    }, headers=auth_headers)

    assert farm_res.status_code == 201
    farm_data = farm_res.json()
    farm_id = farm_data["id"]

    # 2. Add Crop
    crop_res = client.post("/api/v1/farms/crops", json={
        "farm_id": farm_id,
        "name": "Tomato",
        "variety": "PKM-1",
        "sowing_date": "2026-01-15",
        "expected_harvest_date": "2026-04-15",
        "acreage": 2.5,
        "status": "GROWING"
    }, headers=auth_headers)

    assert crop_res.status_code == 201
    crop_data = crop_res.json()
    crop_id = crop_data["id"]

    # 3. Field Note / Observation
    obs_res = client.post("/api/v1/farms/field-notes", json={
        "farm_id": farm_id,
        "crop_id": crop_id,
        "crop_stage": "FLOWERING",
        "observation_type": "PEST",
        "severity": "LOW",
        "notes": "Minor aphid presence observed on lower leaves."
    }, headers=auth_headers)

    assert obs_res.status_code == 201
    assert "Assessment" in obs_res.json()["ai_assessment"]

    # 4. Log Input (Fertilizer)
    input_res = client.post("/api/v1/farms/inputs", json={
        "farm_id": farm_id,
        "crop_id": crop_id,
        "input_type": "FERTILIZER",
        "product_name": "Organic Compost",
        "quantity_used": 50,
        "unit": "KG",
        "cost": 1500.00
    }, headers=auth_headers)

    assert input_res.status_code == 201

    # 5. Log Labour
    labour_res = client.post("/api/v1/farms/labour", json={
        "farm_id": farm_id,
        "crop_id": crop_id,
        "task_type": "WEEDING",
        "worker_count": 3,
        "hours_worked": 8,
        "labor_cost": 1200.00
    }, headers=auth_headers)

    assert labour_res.status_code == 201

    # 6. Record Harvest
    harvest_res = client.post("/api/v1/farms/harvests", json={
        "crop_id": crop_id,
        "harvest_date": "2026-04-10",
        "quantity_harvested_kg": 1000.00,
        "quality_grade": "PREMIUM",
        "wastage_kg": 20.00
    }, headers=auth_headers)

    assert harvest_res.status_code == 201

    # 7. Check Farmer Dashboard calculations
    dash_res = client.get("/api/v1/farms/dashboard", headers=auth_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()

    assert dash_data["total_farms"] >= 1
    assert float(dash_data["total_input_cost"]) >= 1500.00
    assert float(dash_data["total_labor_cost"]) >= 1200.00
    assert float(dash_data["total_harvested_kg"]) >= 1000.00


def test_marketplace_listing_and_order(auth_headers):
    # Setup farm & harvest
    farm_res = client.post("/api/v1/farms", json={
        "name": "Sun Valley Farm",
        "location_name": "Madurai, Tamil Nadu",
        "total_area_acres": 10.0
    }, headers=auth_headers)
    farm_id = farm_res.json()["id"]

    crop_res = client.post("/api/v1/farms/crops", json={
        "farm_id": farm_id,
        "name": "Onion",
        "sowing_date": "2026-01-01",
        "acreage": 4.0
    }, headers=auth_headers)
    crop_id = crop_res.json()["id"]

    harvest_res = client.post("/api/v1/farms/harvests", json={
        "crop_id": crop_id,
        "harvest_date": "2026-04-01",
        "quantity_harvested_kg": 2000.00,
        "quality_grade": "STANDARD"
    }, headers=auth_headers)
    batch_id = harvest_res.json()["id"]
    lot_id = f"lot-{batch_id[:8]}"

    # Publish Listing
    listing_res = client.post("/api/v1/marketplace/listings", json={
        "lot_id": lot_id,
        "title": "Fresh Farm Onions (Red)",
        "description": "Directly harvested red onions from Madurai farm.",
        "price_per_kg": 35.00,
        "available_quantity_kg": 1500.00
    }, headers=auth_headers)

    assert listing_res.status_code == 201
    listing_id = listing_res.json()["id"]

    # Search Listings
    search_res = client.get("/api/v1/marketplace/search?commodity=Onion", headers=auth_headers)
    assert search_res.status_code == 200
    assert len(search_res.json()) >= 1

    # Place Order with Atomic Inventory Reservation
    order_res = client.post("/api/v1/marketplace/orders", json={
        "listing_id": listing_id,
        "quantity_kg": 500.00
    }, headers=auth_headers)

    assert order_res.status_code == 201
    order_data = order_res.json()
    assert float(order_data["total_amount"]) == 500.00 * 35.00
    assert order_data["order_status"] == "CONFIRMED"

    # Update Order Status to IN_TRANSIT
    order_id = order_data["id"]
    status_res = client.post(f"/api/v1/marketplace/orders/{order_id}/status?new_status=IN_TRANSIT", headers=auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["order_status"] == "IN_TRANSIT"
