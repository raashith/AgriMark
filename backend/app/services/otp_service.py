import hmac
import hashlib
import os
import secrets
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

class OtpDeliveryProvider(ABC):
    @abstractmethod
    def send_otp(self, phone_e164: str, code: str) -> bool:
        pass

    @abstractmethod
    def health_check(self) -> bool:
        pass

    @abstractmethod
    def provider_name(self) -> str:
        pass


class MockDeliveryProvider(OtpDeliveryProvider):
    def send_otp(self, phone_e164: str, code: str) -> bool:
        return True

    def health_check(self) -> bool:
        return True

    def provider_name(self) -> str:
        return "mock"


class SmsDeliveryProvider(OtpDeliveryProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("AGRI_SMS_API_KEY", "")

    def send_otp(self, phone_e164: str, code: str) -> bool:
        return True

    def health_check(self) -> bool:
        return True

    def provider_name(self) -> str:
        return "sms"


def get_otp_provider() -> OtpDeliveryProvider:
    provider_type = os.getenv("AGRI_OTP_PROVIDER", "mock").lower()
    if provider_type == "sms":
        return SmsDeliveryProvider()
    return MockDeliveryProvider()


def normalize_phone(phone: str) -> str:
    return OtpManager.normalize_phone(phone)


def validate_coordinates(lat: Any, lng: Any) -> Tuple[bool, str]:
    try:
        OtpManager.validate_coordinate(lat, lng)
        return True, ""
    except ValueError as e:
        return False, str(e)


class OtpChallenge:
    def __init__(
        self,
        challenge_id: str,
        phone_e164: str,
        otp_hash: str,
        expires_at: datetime,
        created_at: Optional[datetime] = None,
        purpose: str = "login",
        max_attempts: int = 5,
        request_ip_hash: Optional[str] = None,
    ):
        self.id = challenge_id
        self.phone_e164 = phone_e164
        self.purpose = purpose
        self.otp_hash = otp_hash
        self.created_at = created_at or datetime.now(timezone.utc)
        self.expires_at = expires_at
        self.attempt_count = 0
        self.max_attempts = max_attempts
        self.resend_count = 0
        self.consumed_at: Optional[datetime] = None
        self.locked_until: Optional[datetime] = None
        self.request_ip_hash = request_ip_hash or "unknown"


class OtpManager:
    @classmethod
    def get_server_secret(cls) -> bytes:
        secret = os.getenv("AGRI_OTP_SECRET") or os.getenv("JWT_SECRET") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not secret:
            # Fallback for non-production unit testing environments
            secret = "agrimark_production_otp_secret_key_2026"
        return secret.encode("utf-8")

    # In-memory challenge repository with rate limiting counters
    _challenges: Dict[str, OtpChallenge] = {}
    _failed_attempt_counters: Dict[str, int] = {}  # phone -> persistent failed count

    @classmethod
    def reset_store(cls):
        cls._challenges.clear()
        cls._failed_attempt_counters.clear()

    @staticmethod
    def generate_otp_code() -> str:
        num = secrets.randbelow(900000) + 100000
        return str(num)

    @classmethod
    def compute_otp_hash(cls, phone_e164: str, challenge_id: str, code: str) -> str:
        msg = f"{phone_e164}:{challenge_id}:{code}".encode("utf-8")
        return hmac.new(cls.get_server_secret(), msg, hashlib.sha256).hexdigest()

    @staticmethod
    def hash_ip(ip_address: Optional[str]) -> str:
        if not ip_address:
            return "unknown_ip"
        return hashlib.sha256(ip_address.encode()).hexdigest()[:32]

    @staticmethod
    def normalize_phone(phone: str) -> str:
        if not phone or not phone.strip():
            raise ValueError("Enter a valid mobile number.")
        raw = phone.strip()
        if raw.startswith("+"):
            digits = "".join(c for c in raw if c.isdigit())
            if len(digits) < 8 or len(digits) > 15:
                raise ValueError("Enter a valid mobile number.")
            return f"+{digits}"
        digits = "".join(c for c in raw if c.isdigit())
        if len(digits) == 10:
            return f"+91{digits}"
        if len(digits) == 11 and digits.startswith("0"):
            return f"+91{digits[1:]}"
        if len(digits) == 12 and digits.startswith("91"):
            return f"+{digits}"
        if 8 <= len(digits) <= 15:
            return f"+{digits}"
        raise ValueError("Enter a valid mobile number.")

    @classmethod
    def validate_coordinate(cls, lat: Any, lng: Any) -> Tuple[float, float]:
        try:
            latitude = float(lat)
            longitude = float(lng)
        except (ValueError, TypeError):
            raise ValueError("Invalid coordinate numbers.")

        if latitude != latitude or longitude != longitude:
            raise ValueError("Invalid coordinate numbers.")
        if abs(latitude) == float("inf") or abs(longitude) == float("inf"):
            raise ValueError("Invalid coordinate numbers.")

        if not (-90.0 <= latitude <= 90.0):
            raise ValueError("Latitude must be between -90 and 90.")
        if not (-180.0 <= longitude <= 180.0):
            raise ValueError("Longitude must be between -180 and 180.")

        return latitude, longitude

    @classmethod
    def create_challenge(
        cls,
        phone_e164: str,
        ip_address: Optional[str] = None,
        purpose: str = "login",
        ttl_minutes: int = 5,
    ) -> Tuple[OtpChallenge, str]:
        now = datetime.now(timezone.utc)
        ip_hash = cls.hash_ip(ip_address)

        # 1. Resend minimum cooldown (60 seconds)
        recent_sends = [
            c for c in cls._challenges.values()
            if c.phone_e164 == phone_e164 and c.purpose == purpose
        ]
        recent_sends.sort(key=lambda x: x.created_at, reverse=True)

        if recent_sends:
            latest = recent_sends[0]
            elapsed = (now - latest.created_at).total_seconds()
            if elapsed < 60:
                raise ValueError("Please wait 60 seconds before requesting another code.")

        # 2. Hourly phone limit (max 5 sends per hour)
        one_hour_ago = now - timedelta(hours=1)
        hourly_count = sum(1 for c in recent_sends if c.created_at >= one_hour_ago)
        if hourly_count >= 5:
            raise ValueError("Unable to send a verification code right now. Please try again later.")

        # 3. Daily phone limit (max 10 sends per 24 hours)
        twenty_four_hours_ago = now - timedelta(hours=24)
        daily_count = sum(1 for c in recent_sends if c.created_at >= twenty_four_hours_ago)
        if daily_count >= 10:
            raise ValueError("Unable to send a verification code right now. Please try again later.")

        # 4. IP limit (max 10 sends per hour per IP)
        ip_count = sum(
            1 for c in cls._challenges.values()
            if c.request_ip_hash == ip_hash and c.created_at >= one_hour_ago
        )
        if ip_count >= 10:
            raise ValueError("Unable to send a verification code right now. Please try again later.")

        # Generate 6-digit OTP code and challenge ID
        code = cls.generate_otp_code()
        challenge_id = str(uuid.uuid4())
        otp_hash = cls.compute_otp_hash(phone_e164, challenge_id, code)
        expires_at = now + timedelta(minutes=ttl_minutes)

        challenge = OtpChallenge(
            challenge_id=challenge_id,
            phone_e164=phone_e164,
            otp_hash=otp_hash,
            expires_at=expires_at,
            created_at=now,
            purpose=purpose,
            request_ip_hash=ip_hash,
        )

        cls._challenges[challenge_id] = challenge
        get_otp_provider().send_otp(phone_e164, code)
        return challenge, code

    @classmethod
    def verify_challenge(cls, challenge_id: str, phone_e164: str, code: str) -> bool:
        now = datetime.now(timezone.utc)
        challenge = cls._challenges.get(challenge_id)

        if not challenge:
            raise ValueError("Unable to verify code. Please request a new verification code.")

        if challenge.phone_e164 != phone_e164:
            raise ValueError("Unable to verify code. Please request a new verification code.")

        if challenge.consumed_at is not None:
            raise ValueError("This verification code has already been used. Please request a new code.")

        if now > challenge.expires_at:
            raise ValueError("This verification code has expired. Please request a new code.")

        if challenge.attempt_count >= challenge.max_attempts:
            raise ValueError("Maximum verification attempts exceeded. Please request a new code.")

        expected_hash = cls.compute_otp_hash(phone_e164, challenge_id, code)
        if not hmac.compare_digest(challenge.otp_hash, expected_hash):
            challenge.attempt_count += 1
            cls._failed_attempt_counters[phone_e164] = cls._failed_attempt_counters.get(phone_e164, 0) + 1
            raise ValueError("Incorrect verification code. Please check the code and try again.")

        # Atomic consumption
        challenge.consumed_at = now
        return True
