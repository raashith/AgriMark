import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


@pytest.fixture
def pilot_farmer_auth_headers():
    phone = "9876543111"
    client.post("/api/v1/auth/register", json={
        "phone": phone,
        "password": "PilotPassword123!",
        "full_name": "Pilot Farmer Murugan",
        "role_name": "FARMER"
    })
    res = client.post("/api/v1/auth/login", json={
        "phone_or_email": phone,
        "password": "PilotPassword123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_pilot_cohort_creation_and_onboarding(pilot_farmer_auth_headers):
    # 1. Create cohort
    c_res = client.post("/api/v1/pilot/cohorts", json={
        "pilot_code": "PILOT-TN-COIMBATORE-01",
        "name": "Coimbatore Smallholder Pilot",
        "district": "Coimbatore",
        "target_farmers": 50
    })
    assert c_res.status_code == 201
    assert c_res.json()["pilot_code"] == "PILOT-TN-COIMBATORE-01"

    # 2. Onboard participant
    ob_res = client.post("/api/v1/pilot/onboard", json={
        "cohort_code": "PILOT-TN-COIMBATORE-01",
        "participant_role": "FARMER",
        "consent_version": "v1.0",
        "consent_granted": True,
        "voice_preference": True
    }, headers=pilot_farmer_auth_headers)

    assert ob_res.status_code == 201
    assert ob_res.json()["consent_granted"] is True
    assert ob_res.json()["voice_preference"] is True


def test_ai_and_market_feedback_loops(pilot_farmer_auth_headers):
    # 1. Log AI Feedback
    ai_fb = client.post("/api/v1/pilot/feedback/ai", json={
        "farmer_question": "What is the recommended bio-pesticide for tomato aphids?",
        "recommendation": "Spray 10,000 PPM Neem Oil formulation at 3ml per litre.",
        "model_version": "AgriMark-Gemini-Pilot-v1",
        "farmer_feedback_rating": 5,
        "action_taken": "ACTED_UPON",
        "outcome_observed": "Aphid population reduced by 85% after 48 hours."
    }, headers=pilot_farmer_auth_headers)

    assert ai_fb.status_code == 201
    assert ai_fb.json()["farmer_feedback_rating"] == 5

    # 2. Log Market Feedback
    mkt_fb = client.post("/api/v1/pilot/feedback/market", json={
        "crop_name": "Tomato",
        "market_name": "Koyambedu Wholesale Market",
        "observed_price": 32.00,
        "recommended_market": "Koyambedu Wholesale Market",
        "listing_price": 35.00,
        "buyer_offer_price": 34.00,
        "final_transaction_price": 34.50,
        "quantity_sold_kg": 500.0,
        "time_to_sale_hours": 18.0
    })

    assert mkt_fb.status_code == 201
    assert float(mkt_fb.json()["final_transaction_price"]) == 34.50


def test_agri_outcome_tracking(pilot_farmer_auth_headers):
    # Setup farm & crop
    farm_res = client.post("/api/v1/farmer/farms", json={
        "name": "Murugan Pilot Farm",
        "location_name": "Pollachi, Coimbatore",
        "total_area_acres": 5.0
    }, headers=pilot_farmer_auth_headers)
    farm_id = farm_res.json()["id"]

    crop_res = client.post("/api/v1/farmer/crops", json={
        "farm_id": farm_id,
        "name": "Tomato",
        "sowing_date": "2026-01-01",
        "acreage": 2.5
    }, headers=pilot_farmer_auth_headers)
    crop_id = crop_res.json()["id"]

    # Record Outcome
    out_res = client.post("/api/v1/pilot/outcomes", json={
        "farm_id": farm_id,
        "crop_id": crop_id,
        "yield_kg": 2500.00,
        "quality_grade": "PREMIUM",
        "input_cost": 3500.00,
        "labor_cost": 2000.00,
        "irrigation_cost": 500.00,
        "selling_price_per_kg": 34.00,
        "farmer_satisfaction_rating": 5
    }, headers=pilot_farmer_auth_headers)

    assert out_res.status_code == 201
    res_json = out_res.json()
    assert float(res_json["gross_revenue"]) == 2500.0 * 34.0
    assert float(res_json["net_profit"]) == (2500.0 * 34.0) - 6000.0


def test_pilot_dashboard_data_quality_and_readiness():
    # Admin Pilot Dashboard
    dash_res = client.get("/api/v1/pilot/dashboard")
    assert dash_res.status_code == 200
    assert dash_res.json()["active_cohorts"] >= 1
    assert dash_res.json()["registered_farms"] >= 1

    # Data Quality Scan
    dq_res = client.get("/api/v1/pilot/data-quality")
    assert dq_res.status_code == 200
    assert dq_res.json()["clean_records_pct"] > 0

    # AI Dataset Readiness
    ds_res = client.get("/api/v1/pilot/dataset-readiness")
    assert ds_res.status_code == 200
    assert ds_res.json()["readiness_status"] in ["PILOT_READY", "PRODUCTION_DATASET_READY"]
    assert "Coimbatore" in ds_res.json()["geographic_districts_covered"]
