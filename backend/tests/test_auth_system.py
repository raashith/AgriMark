import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.core.database import get_db

client = TestClient(app)


def test_auth_system_registration_and_login_flow(db_session: Session):
    """Tests farmer and buyer registration, duplicate prevention, login, /auth/me, refresh, and logout."""

    # 1. Register Farmer
    farmer_payload = {
        "full_name": "Kavitha Selvam",
        "phone": "+919876543210",
        "email": "kavitha.farmer@agrimark.org",
        "password": "FarmerPassword123!",
        "role_name": "farmer",
        "preferred_language": "ta"
    }
    res_reg = client.post("/api/v1/auth/register", json=farmer_payload)
    assert res_reg.status_code == 201
    farmer_data = res_reg.json()
    assert "access_token" in farmer_data
    assert "refresh_token" in farmer_data
    user = farmer_data["user"]
    assert user["full_name"] == "Kavitha Selvam"
    assert user["role"] == "farmer"
    assert user["farmer_profile"] is not None
    assert user["buyer_profile"] is None
    assert user["application_user_id"] is not None
    assert user["profile_id"] is not None

    farmer_token = farmer_data["access_token"]
    farmer_app_id = user["application_user_id"]

    # 2. Prevent Duplicate Registration
    res_dup = client.post("/api/v1/auth/register", json=farmer_payload)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"]

    # 3. Register Buyer
    buyer_payload = {
        "full_name": "Anand Traders",
        "phone": "+919876543211",
        "email": "anand.buyer@agrimark.org",
        "password": "BuyerPassword123!",
        "role_name": "buyer",
        "preferred_language": "en"
    }
    res_buyer = client.post("/api/v1/auth/register", json=buyer_payload)
    assert res_buyer.status_code == 201
    buyer_data = res_buyer.json()
    assert buyer_data["user"]["role"] == "buyer"
    assert buyer_data["user"]["buyer_profile"] is not None
    assert buyer_data["user"]["farmer_profile"] is None

    # 4. Valid Login (by Email)
    res_login_email = client.post("/api/v1/auth/login", json={
        "phone_or_email": "kavitha.farmer@agrimark.org",
        "password": "FarmerPassword123!"
    })
    assert res_login_email.status_code == 200
    assert "access_token" in res_login_email.json()

    # 5. Valid Login (by Phone)
    res_login_phone = client.post("/api/v1/auth/login", json={
        "phone_or_email": "+919876543210",
        "password": "FarmerPassword123!"
    })
    assert res_login_phone.status_code == 200

    # 6. Invalid Password Login
    res_invalid_pass = client.post("/api/v1/auth/login", json={
        "phone_or_email": "+919876543210",
        "password": "WrongPassword!"
    })
    assert res_invalid_pass.status_code == 401

    # 7. Get /auth/me
    headers = {"Authorization": f"Bearer {farmer_token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["application_user_id"] == farmer_app_id
    assert me_data["email"] == "kavitha.farmer@agrimark.org"
    assert me_data["role"] == "farmer"

    # 8. Unauthenticated /auth/me
    res_unauth = client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401

    # 9. Refresh Token
    refresh_payload = {"refresh_token": farmer_data["refresh_token"]}
    res_ref = client.post("/api/v1/auth/refresh", json=refresh_payload)
    assert res_ref.status_code == 200
    assert "access_token" in res_ref.json()

    # 10. Logout
    res_logout = client.post("/api/v1/auth/logout", headers=headers)
    assert res_logout.status_code == 200
    assert res_logout.json()["status"] == "session_terminated"
