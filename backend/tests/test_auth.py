def test_farmer_registration_and_login(client):
    # 1. Register Farmer
    reg_payload = {
        "phone": "9876543210",
        "email": "farmer@example.com",
        "password": "securepassword123",
        "full_name": "Ramesh Kumar",
        "role_name": "farmer",
        "preferred_language": "hi"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["phone"] == "9876543210"
    assert user_data["full_name"] == "Ramesh Kumar"
    assert user_data["role"]["name"] == "farmer"

    # 2. Login Farmer
    login_payload = {
        "phone_or_email": "9876543210",
        "password": "securepassword123"
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Access Protected /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["phone"] == "9876543210"
    assert me_data["role"]["name"] == "farmer"


def test_buyer_registration(client):
    reg_payload = {
        "phone": "9123456789",
        "email": "buyer@example.com",
        "password": "buyerpassword123",
        "full_name": "Anita Sharma",
        "role_name": "buyer",
        "preferred_language": "en"
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"]["name"] == "buyer"


def test_duplicate_registration_rejected(client):
    payload = {
        "phone": "9999999999",
        "email": "dup@example.com",
        "password": "password123",
        "full_name": "Test User",
        "role_name": "farmer"
    }
    resp1 = client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["detail"]


def test_invalid_login_credentials(client):
    login_payload = {
        "phone_or_email": "0000000000",
        "password": "wrongpassword"
    }
    resp = client.post("/api/v1/auth/login", json=login_payload)
    assert resp.status_code == 401
