import os

import pytest

from backend.app.services.agrimark_otp import (
    generate_challenge,
    generate_otp,
    hash_otp,
    normalize_phone,
    verify_hash,
)


@pytest.fixture(autouse=True)
def otp_secret(monkeypatch):
    monkeypatch.setenv("AGRI_OTP_SECRET", "test-secret-that-is-not-production")


def test_generate_otp_is_six_digits():
    codes = {generate_otp() for _ in range(1000)}
    assert len(codes) > 900
    assert all(len(code) == 6 and code.isdigit() for code in codes)


def test_generate_challenge_returns_code_that_matches_hash():
    challenge, expected_hash = generate_challenge("9876543210")
    assert len(challenge.code) == 6
    assert verify_hash(
        "9876543210",
        challenge.challenge_id,
        "login",
        challenge.code,
        expected_hash,
    )


def test_wrong_code_does_not_verify():
    challenge, expected_hash = generate_challenge("9876543210")
    wrong = "000000" if challenge.code != "000000" else "111111"
    assert not verify_hash(
        "9876543210",
        challenge.challenge_id,
        "login",
        wrong,
        expected_hash,
    )


def test_phone_normalization():
    assert normalize_phone("9876543210") == "+919876543210"
    assert normalize_phone("09876543210") == "+919876543210"
    assert normalize_phone("+919876543210") == "+919876543210"
    assert normalize_phone("919876543210") == "+919876543210"


def test_invalid_phone():
    with pytest.raises(ValueError):
        normalize_phone("123")


def test_otp_hash_is_bound_to_challenge():
    first = hash_otp("+919876543210", "challenge-a", "login", "123456")
    second = hash_otp("+919876543210", "challenge-b", "login", "123456")
    assert first != second


def test_otp_hash_is_bound_to_purpose():
    login_hash = hash_otp("+919876543210", "challenge-a", "login", "123456")
    change_phone_hash = hash_otp("+919876543210", "challenge-a", "phone_change", "123456")
    assert login_hash != change_phone_hash
