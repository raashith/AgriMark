import hashlib
import hmac
import os
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

OTP_TTL_SECONDS = 5 * 60
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_ATTEMPTS = 5
OTP_PHONE_HOURLY_LIMIT = 5
OTP_PHONE_DAILY_LIMIT = 10
OTP_IP_HOURLY_LIMIT = 10


@dataclass(frozen=True)
class GeneratedOtp:
    challenge_id: str
    code: str
    expires_at: datetime


def normalize_phone(phone: str) -> str:
    raw = (phone or "").strip()
    if raw.startswith("+"):
        digits = "".join(ch for ch in raw if ch.isdigit())
        if not 8 <= len(digits) <= 15:
            raise ValueError("Enter a valid mobile number.")
        return f"+{digits}"

    digits = "".join(ch for ch in raw if ch.isdigit())
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 11 and digits.startswith("0"):
        return f"+91{digits[1:]}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"

    raise ValueError("Enter a valid mobile number.")


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_challenge_id() -> str:
    return str(uuid.uuid4())


def hash_ip(ip_address: str | None) -> str:
    secret = os.environ.get("AGRI_OTP_SECRET")
    if not secret:
        raise RuntimeError("AGRI_OTP_SECRET is not configured.")
    return hmac.new(
        secret.encode("utf-8"),
        (ip_address or "unknown").encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def hash_otp(phone_e164: str, challenge_id: str, purpose: str, code: str) -> str:
    secret = os.environ.get("AGRI_OTP_SECRET")
    if not secret:
        raise RuntimeError("AGRI_OTP_SECRET is not configured.")
    message = f"{phone_e164}|{challenge_id}|{purpose}|{code}".encode("utf-8")
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def generate_challenge(phone_e164: str, purpose: str = "login") -> tuple[GeneratedOtp, str]:
    normalized = normalize_phone(phone_e164)
    challenge_id = generate_challenge_id()
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=OTP_TTL_SECONDS)
    return (
        GeneratedOtp(
            challenge_id=challenge_id,
            code=code,
            expires_at=expires_at,
        ),
        hash_otp(normalized, challenge_id, purpose, code),
    )


def verify_hash(phone_e164: str, challenge_id: str, purpose: str, submitted_code: str, expected_hash: str) -> bool:
    if not submitted_code.isdigit() or len(submitted_code) != 6:
        return False
    actual = hash_otp(normalize_phone(phone_e164), challenge_id, purpose, submitted_code)
    return hmac.compare_digest(actual, expected_hash)
