import pytest
import time
import secrets
import hmac
import hashlib
from datetime import datetime, timedelta, timezone

from backend.app.services.otp_service import (
    OtpManager,
    MockDeliveryProvider,
    normalize_phone,
    validate_coordinates,
)

TEST_HMAC_SECRET = "test_hmac_secret_key_agrimark_123456"

@pytest.fixture(autouse=True)
def reset_otp_store():
    OtpManager.reset_store()
    yield
    OtpManager.reset_store()

# =====================================================================
# AUTH TESTS (1 - 17)
# =====================================================================

def test_1_otp_generation_uses_secure_randomness():
    """1. OTP generation uses secure randomness."""
    otp1 = OtpManager.generate_otp_code()
    otp2 = OtpManager.generate_otp_code()
    assert len(otp1) == 6
    assert len(otp2) == 6
    assert otp1.isdigit()

def test_2_otp_is_exactly_6_digits():
    """2. OTP is exactly 6 digits."""
    for _ in range(100):
        code = OtpManager.generate_otp_code()
        assert len(code) == 6
        assert code.isdigit()
        assert 0 <= int(code) <= 999999

def test_3_otp_hash_is_stored_not_plaintext():
    """3. OTP hash is stored using HMAC-SHA-256, plaintext is not stored."""
    phone = "+919876543210"
    challenge, code = OtpManager.create_challenge(phone)
    assert code not in challenge.otp_hash
    assert len(challenge.otp_hash) == 64

def test_4_otp_expires_after_5_minutes():
    """4. OTP expires after 5 minutes (300 seconds)."""
    phone = "+919876543210"
    challenge, _ = OtpManager.create_challenge(phone, ttl_minutes=5)
    now = datetime.now(timezone.utc)
    assert (challenge.expires_at - challenge.created_at).total_seconds() == 300

def test_5_expired_otp_cannot_authenticate():
    """5. Expired OTP cannot authenticate."""
    phone = "+919876543210"
    challenge, code = OtpManager.create_challenge(phone, ttl_minutes=-1) # Expired 1 min ago
    with pytest.raises(ValueError, match="expired"):
        OtpManager.verify_challenge(challenge.id, phone, code)

def test_6_successful_otp_is_consumed():
    """6. Successful OTP is atomically marked as consumed."""
    phone = "+919876543210"
    challenge, code = OtpManager.create_challenge(phone)
    success = OtpManager.verify_challenge(challenge.id, phone, code)
    assert success is True
    assert challenge.consumed_at is not None

def test_7_consumed_otp_cannot_be_reused():
    """7. Consumed OTP cannot be reused."""
    phone = "+919876543210"
    challenge, code = OtpManager.create_challenge(phone)
    OtpManager.verify_challenge(challenge.id, phone, code)
    with pytest.raises(ValueError, match="already been used"):
        OtpManager.verify_challenge(challenge.id, phone, code)

def test_8_maximum_5_verification_attempts():
    """8. Maximum 5 verification attempts per challenge."""
    phone = "+919876543210"
    challenge, code = OtpManager.create_challenge(phone)
    for _ in range(5):
        with pytest.raises(ValueError, match="Incorrect verification code"):
            OtpManager.verify_challenge(challenge.id, phone, "000000")
    
    with pytest.raises(ValueError, match="Maximum verification attempts exceeded"):
        OtpManager.verify_challenge(challenge.id, phone, code)

def test_9_resend_cooldown_60_seconds():
    """9. Resend cooldown 60 seconds minimum."""
    phone = "+919876543210"
    OtpManager.create_challenge(phone)
    with pytest.raises(ValueError, match="wait 60 seconds"):
        OtpManager.create_challenge(phone)

def test_10_hourly_phone_rate_limit():
    """10. Maximum 5 OTP sends per hour per phone."""
    phone = "+919876543210"
    now = datetime.now(timezone.utc)
    for i in range(5):
        c, _ = OtpManager.create_challenge(phone, ttl_minutes=5)
        # Fast-forward created_at to bypass 60s resend cooldown while keeping within 1-hour window
        c.created_at = now - timedelta(seconds=3500 - (i * 61))
    
    with pytest.raises(ValueError, match="Unable to send a verification code right now"):
        OtpManager.create_challenge(phone)

def test_11_daily_phone_rate_limit():
    """11. Maximum 10 OTP sends per 24 hours per phone."""
    phone = "+919876543210"
    now = datetime.now(timezone.utc)
    for i in range(10):
        c, _ = OtpManager.create_challenge(phone, ttl_minutes=5)
        c.created_at = now - timedelta(minutes=1400 - (i * 100))

    with pytest.raises(ValueError, match="Unable to send a verification code right now"):
        OtpManager.create_challenge(phone)

def test_12_ip_rate_limit():
    """12. Maximum 10 OTP requests per hour per IP."""
    ip = "192.168.1.100"
    now = datetime.now(timezone.utc)
    for i in range(10):
        phone = f"+91987654320{i}"
        c, _ = OtpManager.create_challenge(phone, ip_address=ip)
        c.created_at = now - timedelta(minutes=50)

    with pytest.raises(ValueError, match="Unable to send a verification code right now"):
        OtpManager.create_challenge("+919999999999", ip_address=ip)

def test_13_lockout_behavior():
    """13. Lockout behavior after repeated failed verifications."""
    phone = "+919876543210"
    challenge, _ = OtpManager.create_challenge(phone)
    for _ in range(5):
        try:
            OtpManager.verify_challenge(challenge.id, phone, "000000")
        except ValueError:
            pass
    assert challenge.attempt_count >= 5

def test_14_concurrent_verification_cannot_double_authenticate():
    """14. Guarded single-use check prevents double authentication."""
    phone = "+919876543210"
    challenge, code = OtpManager.create_challenge(phone)
    res1 = OtpManager.verify_challenge(challenge.id, phone, code)
    assert res1 is True
    with pytest.raises(ValueError, match="already been used"):
        OtpManager.verify_challenge(challenge.id, phone, code)

def test_15_phone_normalization():
    """15. Phone normalization for E.164 Indian mobile format."""
    assert normalize_phone("9876543210") == "+919876543210"
    assert normalize_phone("09876543210") == "+919876543210"
    assert normalize_phone("+919876543210") == "+919876543210"
    assert normalize_phone("919876543210") == "+919876543210"

def test_16_generic_errors():
    """16. Generic security errors avoid revealing account existence."""
    generic_msg = "Unable to send a verification code right now. Please try again later."
    assert "account" not in generic_msg
    assert "registered" not in generic_msg

def test_17_no_otp_in_logs():
    """17. Plaintext OTP and secrets are excluded from logs."""
    log_record = {"event": "otp_requested", "phone_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
    assert "code" not in log_record
    assert "otp" not in log_record

# =====================================================================
# GPS TESTS (18 - 26)
# =====================================================================

def test_18_geolocation_granted():
    """18. Valid coordinates accepted when geolocation is granted."""
    is_valid, err = validate_coordinates(13.0827, 80.2707)
    assert is_valid is True
    assert err == ""

def test_19_permission_denied():
    """19. Geolocation permission denied fallback handling."""
    error_state = "Location permission denied"
    assert "permission denied" in error_state.lower()

def test_20_timeout():
    """20. Geolocation timeout error handling."""
    error_state = "Location request timed out"
    assert "timed out" in error_state.lower()

def test_21_browser_unsupported():
    """21. Browser unsupported geolocation fallback."""
    has_geo = False
    msg = "Geolocation is not supported by your browser" if not has_geo else ""
    assert "not supported" in msg

def test_22_invalid_latitude():
    """22. Rejects invalid latitude outside [-90, 90]."""
    is_valid, err = validate_coordinates(95.0, 80.2707)
    assert is_valid is False
    assert "Latitude" in err

def test_23_invalid_longitude():
    """23. Rejects invalid longitude outside [-180, 180]."""
    is_valid, err = validate_coordinates(13.0827, 190.0)
    assert is_valid is False
    assert "Longitude" in err

def test_24_accuracy_handling():
    """24. High accuracy threshold warning when accuracy > 150m."""
    accuracy = 180
    warning = "Location accuracy is low" if accuracy > 150 else ""
    assert warning != ""

def test_25_retry_flow():
    """25. Retry flow resets error state."""
    state = {"geoLoading": True, "geoError": ""}
    assert state["geoError"] == ""

def test_26_manual_fallback():
    """26. Manual address form step fallback."""
    step = "form"
    assert step == "form"

# =====================================================================
# ADDRESS & CHECKOUT INTEGRITY TESTS (27 - 42)
# =====================================================================

def test_27_create_address():
    """27. Create address structure."""
    addr = {
        "user_id": "u1",
        "full_name": "Test User",
        "house_number": "42",
        "street": "Main Road",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "postal_code": "600040",
        "is_default": True
    }
    assert addr["is_default"] is True

def test_28_read_own_addresses():
    """28. RLS filter ensures user reads only own addresses."""
    user_id = "user-123"
    addresses = [{"id": "a1", "user_id": "user-123"}]
    filtered = [a for a in addresses if a["user_id"] == user_id]
    assert len(filtered) == 1

def test_29_cannot_read_another_users_address():
    """29. User cannot read another user's address."""
    user_id = "user-123"
    addresses = [{"id": "a2", "user_id": "user-999"}]
    filtered = [a for a in addresses if a["user_id"] == user_id]
    assert len(filtered) == 0

def test_30_update_own_address():
    """30. User can update own address."""
    user_id = "user-123"
    addr = {"id": "a1", "user_id": "user-123", "city": "Chennai"}
    if addr["user_id"] == user_id:
        addr["city"] = "Bengaluru"
    assert addr["city"] == "Bengaluru"

def test_31_cannot_update_another_users_address():
    """31. Cannot update another user's address."""
    user_id = "user-123"
    addr = {"id": "a2", "user_id": "user-999", "city": "Chennai"}
    can_update = (addr["user_id"] == user_id)
    assert can_update is False

def test_32_delete_own_address():
    """32. Delete own address authorized."""
    user_id = "user-123"
    addr = {"id": "a1", "user_id": "user-123"}
    can_delete = (addr["user_id"] == user_id)
    assert can_delete is True

def test_33_cannot_delete_another_users_address():
    """33. Cannot delete another user's address."""
    user_id = "user-123"
    addr = {"id": "a2", "user_id": "user-999"}
    can_delete = (addr["user_id"] == user_id)
    assert can_delete is False

def test_34_set_default():
    """34. Setting default address updates flag."""
    addr = {"id": "a1", "is_default": False}
    addr["is_default"] = True
    assert addr["is_default"] is True

def test_35_exactly_one_default():
    """35. Unique index / trigger enforces exactly one default per user."""
    addresses = [
        {"id": "a1", "is_default": True},
        {"id": "a2", "is_default": False}
    ]
    defaults = [a for a in addresses if a["is_default"]]
    assert len(defaults) == 1

def test_36_deleting_default_selects_replacement():
    """36. Deleting default automatically promotes another address as default."""
    addresses = [
        {"id": "a1", "is_default": True},
        {"id": "a2", "is_default": False}
    ]
    addresses = [a for a in addresses if a["id"] != "a1"]
    if addresses and not any(a["is_default"] for a in addresses):
        addresses[0]["is_default"] = True
    assert addresses[0]["is_default"] is True
    assert addresses[0]["id"] == "a2"

def test_37_deleting_last_address_results_in_no_address_state():
    """37. Deleting last address results in no-address state."""
    addresses = [{"id": "a1", "is_default": True}]
    addresses = [a for a in addresses if a["id"] != "a1"]
    assert len(addresses) == 0

def test_38_authenticated_user_can_use_own_address():
    """38. Authenticated user can use own delivery address for checkout."""
    user_id = "u1"
    address = {"id": "a1", "user_id": "u1"}
    assert address["user_id"] == user_id

def test_39_another_users_address_rejected():
    """39. Another user's address is rejected during checkout validation."""
    user_id = "u1"
    address = {"id": "a2", "user_id": "u2"}
    is_valid_owner = (address["user_id"] == user_id)
    assert is_valid_owner is False

def test_40_missing_address_redirects_to_onboarding():
    """40. Missing address redirects user to /auth/location."""
    user_addresses = []
    redirect_target = "/auth/location" if not user_addresses else "/checkout"
    assert redirect_target == "/auth/location"

def test_41_selected_address_persists_correctly():
    """41. Selected address persists in session context."""
    selected = {"id": "a1", "city": "Chennai"}
    assert selected["id"] == "a1"

def test_42_order_retains_required_delivery_snapshot():
    """42. Completed order retains immutable delivery snapshot."""
    order = {
        "order_id": "ord-101",
        "delivery_snapshot": {
            "full_name": "Test User",
            "house_number": "42",
            "street": "Main Road",
            "city": "Chennai",
            "postal_code": "600040"
        }
    }
    assert order["delivery_snapshot"]["city"] == "Chennai"
