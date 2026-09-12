import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def farmer_auth_headers():
    phone = "9876543299"
    client.post("/api/v1/auth/register", json={
        "phone": phone,
        "password": "FarmerPassword123!",
        "full_name": "Ramasamy Farmer",
        "role_name": "FARMER"
    })
    res = client.post("/api/v1/auth/login", json={
        "phone_or_email": phone,
        "password": "FarmerPassword123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_farmer_profile_and_preferences(farmer_auth_headers):
    # 1. Get profile
    prof_res = client.get("/api/v1/farmer/profile", headers=farmer_auth_headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["full_name"] == "Ramasamy Farmer"

    # 2. Update profile
    upd_res = client.put("/api/v1/farmer/profile", json={
        "fpo_member_id": "FPO-TN-042",
        "experience_years": 15,
        "primary_crops": "Tomato, Paddy, Onion",
        "preferred_language": "ta"
    }, headers=farmer_auth_headers)

    assert upd_res.status_code == 200
    assert upd_res.json()["fpo_member_id"] == "FPO-TN-042"
    assert upd_res.json()["experience_years"] == 15

    # 3. Preferences
    pref_res = client.get("/api/v1/farmer/preferences", headers=farmer_auth_headers)
    assert pref_res.status_code == 200
    assert pref_res.json()["preferred_language"] == "ta"

    upd_pref = client.put("/api/v1/farmer/preferences", json={
        "notification_channel": "WHATSAPP",
        "currency": "INR"
    }, headers=farmer_auth_headers)
    assert upd_pref.status_code == 200
    assert upd_pref.json()["notification_channel"] == "WHATSAPP"


def test_farmer_farms_and_crops_management(farmer_auth_headers):
    # 1. Create Farm
    farm_res = client.post("/api/v1/farmer/farms", json={
        "name": "Cauvery Delta Farm",
        "location_name": "Thanjavur, Tamil Nadu",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "total_area_acres": 8.0,
        "soil_type": "ALLUVIAL",
        "irrigation_source": "CANAL"
    }, headers=farmer_auth_headers)
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # 2. Get Farm by ID
    get_farm = client.get(f"/api/v1/farmer/farms/{farm_id}", headers=farmer_auth_headers)
    assert get_farm.status_code == 200
    assert get_farm.json()["name"] == "Cauvery Delta Farm"

    # 3. Add Crop
    crop_res = client.post("/api/v1/farmer/crops", json={
        "farm_id": farm_id,
        "name": "Paddy",
        "variety": "CR-1009 Sub-1",
        "sowing_date": "2026-01-10",
        "expected_harvest_date": "2026-05-10",
        "acreage": 5.0,
        "status": "GROWING"
    }, headers=farmer_auth_headers)
    assert crop_res.status_code == 201
    crop_id = crop_res.json()["id"]

    # 4. List Farmer Crops
    crops_list = client.get("/api/v1/farmer/crops", headers=farmer_auth_headers)
    assert crops_list.status_code == 200
    assert len(crops_list.json()) >= 1

    # 5. Update Crop
    crop_upd = client.put(f"/api/v1/farmer/crops/{crop_id}?status=HARVEST_READY", headers=farmer_auth_headers)
    assert crop_upd.status_code == 200
    assert crop_upd.json()["status"] == "HARVEST_READY"


def test_field_notes_inputs_labour_and_tasks(farmer_auth_headers):
    # Setup Farm
    farm_res = client.post("/api/v1/farmer/farms", json={
        "name": "Hilltop Organic Farm",
        "location_name": "Dindigul, Tamil Nadu",
        "total_area_acres": 3.0
    }, headers=farmer_auth_headers)
    farm_id = farm_res.json()["id"]

    # 1. Observation
    obs_res = client.post("/api/v1/farmer/observations", json={
        "farm_id": farm_id,
        "crop_stage": "VEGETATIVE",
        "observation_type": "NUTRIENT",
        "severity": "LOW",
        "notes": "Slight yellowing observed on lower leaves. Nitrogen top-dressing required."
    }, headers=farmer_auth_headers)
    assert obs_res.status_code == 201

    obs_list = client.get("/api/v1/farmer/observations", headers=farmer_auth_headers)
    assert obs_list.status_code == 200
    assert len(obs_list.json()) >= 1

    # 2. Inputs
    input_res = client.post("/api/v1/farmer/inputs", json={
        "farm_id": farm_id,
        "input_type": "FERTILIZER",
        "product_name": "Neem Coated Urea",
        "quantity_used": 45.0,
        "unit": "KG",
        "cost": 1200.00
    }, headers=farmer_auth_headers)
    assert input_res.status_code == 201

    # 3. Labour
    labour_res = client.post("/api/v1/farmer/labour", json={
        "farm_id": farm_id,
        "task_type": "FERTILIZER_APPLICATION",
        "worker_count": 2,
        "hours_worked": 4.0,
        "labor_cost": 800.00
    }, headers=farmer_auth_headers)
    assert labour_res.status_code == 201

    # 4. Tasks
    task_res = client.post("/api/v1/farmer/tasks", json={
        "farm_id": farm_id,
        "title": "Irrigate paddy field plot 2",
        "due_date": "2026-09-15",
        "priority": "HIGH"
    }, headers=farmer_auth_headers)
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    task_patch = client.patch(f"/api/v1/farmer/tasks/{task_id}?status=COMPLETED", headers=farmer_auth_headers)
    assert task_patch.status_code == 200
    assert task_patch.json()["status"] == "COMPLETED"


def test_harvest_finance_and_profitability(farmer_auth_headers):
    # Create farm & crop
    farm_res = client.post("/api/v1/farmer/farms", json={
        "name": "Vigorous Tomato Farm",
        "location_name": "Salem, Tamil Nadu",
        "total_area_acres": 4.0
    }, headers=farmer_auth_headers)
    farm_id = farm_res.json()["id"]

    crop_res = client.post("/api/v1/farmer/crops", json={
        "farm_id": farm_id,
        "name": "Tomato",
        "sowing_date": "2026-01-01",
        "acreage": 2.0
    }, headers=farmer_auth_headers)
    crop_id = crop_res.json()["id"]

    # Record Harvest
    h_res = client.post("/api/v1/farmer/harvests", json={
        "crop_id": crop_id,
        "harvest_date": "2026-04-01",
        "quantity_harvested_kg": 3000.0,
        "quality_grade": "PREMIUM"
    }, headers=farmer_auth_headers)
    assert h_res.status_code == 201

    # Finance Entry (Income)
    fin_res = client.post("/api/v1/farmer/finance", json={
        "farm_id": farm_id,
        "crop_id": crop_id,
        "entry_type": "INCOME",
        "category": "SALES",
        "amount": 90000.00,
        "notes": "Direct mandi sale proceeds"
    }, headers=farmer_auth_headers)
    assert fin_res.status_code == 201

    # Check Farm Profitability
    prof_res = client.get(f"/api/v1/farmer/profitability?farm_id={farm_id}", headers=farmer_auth_headers)
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert len(prof_data) == 1
    assert float(prof_data[0]["total_revenue"]) >= 90000.00


def test_market_intelligence_and_price_prediction():
    # Prices list
    p_res = client.get("/api/v1/market/prices?crop_name=Tomato")
    assert p_res.status_code == 200
    assert len(p_res.json()) >= 1

    # Best market recommendation
    bm_res = client.get("/api/v1/market/best-markets?crop_name=Tomato")
    assert bm_res.status_code == 200
    assert "recommended_market" in bm_res.json()

    # Price Prediction engine
    pred_res = client.get("/api/v1/market/predict-price?crop_name=Tomato&horizon_days=7")
    assert pred_res.status_code == 200
    assert float(pred_res.json()["predicted_price_inr_per_kg"]) > 0
    assert pred_res.json()["model_version"] == "AgriMark-Baseline-ARIMA-v1.2"


def test_weather_intelligence():
    w_res = client.get("/api/v1/weather/current?location=Coimbatore")
    assert w_res.status_code == 200
    assert w_res.json()["temperature_c"] > 0

    agri_w = client.get("/api/v1/weather/agriculture?location=Coimbatore")
    assert agri_w.status_code == 200
    assert "pest_disease_risk" in agri_w.json()


def test_agri_ai_chat_farm_awareness(farmer_auth_headers):
    chat_res = client.post("/api/v1/agri-ai/chat", json={
        "query": "தக்காளி சந்தை விலை enna?",
        "language": "ta-IN"
    }, headers=farmer_auth_headers)

    assert chat_res.status_code == 200
    res_json = chat_res.json()
    assert "Tomato" in res_json["answer"] or "சந்தை" in res_json["answer"] or "mandi" in res_json["answer"]
    assert res_json["detected_intent"] == "MARKET_PRICE_INQUIRY"


def test_offline_sync_queue(farmer_auth_headers):
    sync_res = client.post("/api/v1/farmer/sync-offline-queue", json={
        "items": [
            {
                "idempotency_key": "IDEM-KEY-001",
                "action_type": "CREATE_FIELD_NOTE",
                "payload": {"notes": "Offline field note recorded"}
            },
            {
                "idempotency_key": "IDEM-KEY-001", # duplicate
                "action_type": "CREATE_FIELD_NOTE",
                "payload": {"notes": "Offline field note recorded duplicate"}
            }
        ]
    }, headers=farmer_auth_headers)

    assert sync_res.status_code == 200
    s_json = sync_res.json()
    assert s_json["processed_count"] == 1
    assert s_json["duplicate_count"] == 1


def test_documents_feedback_and_traceability(farmer_auth_headers):
    # Upload document
    doc_res = client.post("/api/v1/farmer/documents", json={
        "document_type": "LAND_RECORD",
        "title": "Patta Chitta Copy 2026",
        "file_url": "https://storage.agrimark.in/docs/patta_001.pdf"
    }, headers=farmer_auth_headers)
    assert doc_res.status_code == 201

    docs_list = client.get("/api/v1/farmer/documents", headers=farmer_auth_headers)
    assert docs_list.status_code == 200
    assert len(docs_list.json()) >= 1

    # Submit feedback
    fb_res = client.post("/api/v1/farmer/feedback", json={
        "category": "APP_UX",
        "message": "Simple Tamil voice interaction works great!",
        "rating": 5
    }, headers=farmer_auth_headers)
    assert fb_res.status_code == 201

    # Produce Traceability
    tr_res = client.get("/api/v1/marketplace/traceability/REF-LOT-001")
    assert tr_res.status_code == 200
    assert "status_chain" in tr_res.json()
