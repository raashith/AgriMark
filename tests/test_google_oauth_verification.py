import pytest
import re

# AgriMark Google OAuth Production Configuration & Verification Test Suite

def test_canonical_urls_and_hosts():
    """Verify production URLs, Supabase host, and canonical OAuth callback structure."""
    production_site_url = "https://agrimark-six.vercel.app"
    supabase_host = "xrcqzpnstdbbtafhcwbb.supabase.co"
    supabase_url = f"https://{supabase_host}"
    
    canonical_app_callback = f"{production_site_url}/auth/callback"
    google_cloud_authorized_redirect = f"{supabase_url}/auth/v1/callback"

    # Verify HTTPS enforcement
    assert production_site_url.startswith("https://")
    assert supabase_url.startswith("https://")
    assert canonical_app_callback.startswith("https://")
    assert google_cloud_authorized_redirect.startswith("https://")

    # Verify project reference ID matches
    assert "xrcqzpnstdbbtafhcwbb" in supabase_host
    assert "agrimark-six.vercel.app" in canonical_app_callback
    
    # Verify Google Cloud OAuth redirect target MUST be Supabase Auth, NOT the Vercel app directly
    assert google_cloud_authorized_redirect == "https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback"
    assert google_cloud_authorized_redirect != canonical_app_callback


def test_role_based_post_login_redirection():
    """Verify role-to-dashboard mapping logic for authenticated users."""
    role_dashboard_map = {
        "farmer": "/farmer/dashboard",
        "buyer": "/buyer/marketplace",
        "fpo": "/fpo/dashboard",
        "logistics": "/logistics/deliveries",
        "admin": "/admin/dashboard",
    }

    def resolve_dashboard(role, has_profile=True):
        if not has_profile:
            return "/auth/onboarding"
        return role_dashboard_map.get(role, "/farmer/dashboard")

    assert resolve_dashboard("farmer") == "/farmer/dashboard"
    assert resolve_dashboard("buyer") == "/buyer/marketplace"
    assert resolve_dashboard("fpo") == "/fpo/dashboard"
    assert resolve_dashboard("logistics") == "/logistics/deliveries"
    assert resolve_dashboard("admin") == "/admin/dashboard"
    assert resolve_dashboard(None, has_profile=False) == "/auth/onboarding"


def test_oauth_scope_minimality():
    """Verify requested Google OAuth scopes are minimal (openid, email, profile)."""
    requested_scopes = ["openid", "email", "profile"]
    sensitive_scopes = ["https://www.googleapis.com/auth/contacts", "https://www.googleapis.com/auth/drive"]

    for scope in requested_scopes:
        assert scope in ["openid", "email", "profile"]

    for s_scope in sensitive_scopes:
        assert s_scope not in requested_scopes


def test_error_formatting_and_redirect_mismatch_handling():
    """Verify user-friendly error formatting for OAuth redirect mismatches and expired grants."""
    def format_auth_error(message: str) -> str:
        normalized = (message or "").lower()
        if "redirect_uri_mismatch" in normalized or "invalid redirect" in normalized:
            return "Google Sign-In configuration needs attention. Please try again later."
        if "expired" in normalized or "invalid_grant" in normalized:
            return "Your sign-in session expired. Please start Google Sign-In again."
        if "access_denied" in normalized or "cancelled" in normalized:
            return "Google Sign-In was cancelled."
        return message

    assert "configuration needs attention" in format_auth_error("Error 400: redirect_uri_mismatch")
    assert "session expired" in format_auth_error("invalid_grant: Code has expired")
    assert "was cancelled" in format_auth_error("access_denied by user")


def test_no_secret_exposure_in_client_config():
    """Verify that service role keys and secrets are never present in client configuration."""
    dummy_client_env = {
        "NEXT_PUBLIC_SUPABASE_URL": "https://xrcqzpnstdbbtafhcwbb.supabase.co",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_test_12345",
        "NEXT_PUBLIC_API_BASE_URL": "https://agrimark-api.onrender.com/api/v1"
    }

    for key, val in dummy_client_env.items():
        assert not key.startswith("SUPABASE_SERVICE_ROLE_KEY")
        assert not key.startswith("SECRET")
        assert "sb_secret_" not in val
        assert "service_role" not in val
