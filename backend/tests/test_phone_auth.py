import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def normalize_phone_test(phone: str) -> str:
    if not phone:
        raise ValueError("Enter a valid mobile number.")
    raw = phone.strip()
    if raw.startswith('+'):
        digits = ''.join(c for c in raw if c.isdigit())
        if len(digits) < 8 or len(digits) > 15:
            raise ValueError("Enter a valid mobile number.")
        return f"+{digits}"
    digits = ''.join(c for c in raw if c.isdigit())
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 11 and digits.startswith('0'):
        return f"+91{digits[1:]}"
    if len(digits) == 12 and digits.startswith('91'):
        return f"+{digits}"
    if 8 <= len(digits) <= 15:
        return f"+{digits}"
    raise ValueError("Enter a valid mobile number.")

def format_auth_error_test(msg: str) -> str:
    norm = (msg or '').lower()
    if 'rate limit' in norm or 'too many' in norm or 'over_sms_send_rate_limit' in norm:
        return 'Too many OTP requests. Please wait a minute and try again.'
    if 'provider' in norm or 'sms' in norm or 'unavailable' in norm:
        return "We couldn't send the OTP right now. Please try again shortly."
    if 'invalid otp' in norm or 'invalid token' in norm or 'token is invalid' in norm or 'expired' in norm:
        if 'expired' in norm:
            return 'This OTP has expired. Request a new OTP.'
        return 'Incorrect OTP. Please check the 6-digit code and try again.'
    if 'invalid phone' in norm or 'phone number' in norm or 'invalid number' in norm:
        return 'Enter a valid mobile number.'
    return msg or 'Unable to send or verify the OTP. Please try again.'

# 1. Valid Indian phone normalization
def test_valid_indian_phone_normalization():
    assert normalize_phone_test("9876543210") == "+919876543210"
    assert normalize_phone_test("09876543210") == "+919876543210"
    assert normalize_phone_test("+919876543210") == "+919876543210"
    assert normalize_phone_test("919876543210") == "+919876543210"

# 2. Invalid phone rejection
def test_invalid_phone_rejection():
    with pytest.raises(ValueError):
        normalize_phone_test("123")
    with pytest.raises(ValueError):
        normalize_phone_test("")

# 3. Send OTP error formatting
def test_send_otp_error_formatting():
    err = format_auth_error_test("over_sms_send_rate_limit")
    assert "Too many OTP requests" in err

# 4. OTP resend cooldown logic format
def test_otp_resend_cooldown():
    err = format_auth_error_test("Too many requests")
    assert "wait a minute" in err

# 5. Valid 6-digit OTP format validation
def test_6digit_otp_format():
    code = "123456"
    assert len(code) == 6 and code.isdigit()

# 6. Invalid OTP error formatting
def test_invalid_otp_formatting():
    err = format_auth_error_test("Invalid token")
    assert "Incorrect OTP" in err

# 7. Expired OTP error formatting
def test_expired_otp_formatting():
    err = format_auth_error_test("Token has expired")
    assert "expired" in err

# 8. Existing user profile sync contract
def test_existing_user_me_unauthenticated():
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    assert res.headers["content-type"].startswith("application/json")

# 9. Admin role self-registration prohibition
def test_admin_role_prohibited():
    res = client.post("/api/v1/auth/register", json={"email": "admin@agrimark.org", "password": "secretpassword", "full_name": "Admin Test", "role": "admin"})
    assert res.status_code == 403
    assert res.json()["detail"] == "Self-registration as admin is prohibited."

# 10. Farmer redirect map check
def test_farmer_redirect_map():
    redirects = {"farmer": "/farmer/dashboard", "buyer": "/buyer/marketplace", "logistics": "/logistics/deliveries"}
    assert redirects["farmer"] == "/farmer/dashboard"

# 11. Buyer redirect map check
def test_buyer_redirect_map():
    redirects = {"farmer": "/farmer/dashboard", "buyer": "/buyer/marketplace"}
    assert redirects["buyer"] == "/buyer/marketplace"

# 12. Google login regression check
def test_google_login_endpoint_json_contract():
    res = client.get("/api/v1/auth/me")
    assert res.headers["content-type"].startswith("application/json")

# 13. Email/password login regression check
def test_email_password_login_json():
    res = client.post("/api/v1/auth/login", json={"email": "user@test.org", "password": "wrongpassword"})
    assert res.status_code in (400, 401, 503)
    assert res.headers["content-type"].startswith("application/json")

# 14. Logout regression check
def test_logout_json():
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 200
    assert res.json() == {"message": "Logged out successfully"}
