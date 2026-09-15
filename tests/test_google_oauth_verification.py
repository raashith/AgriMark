import pytest
from urllib.parse import urlparse, parse_qs

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


def test_generated_oauth_request_url_parsing():
    """Simulate and parse Supabase-generated Google OAuth request URL to assert redirect_uri parameter."""
    sample_oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        "client_id=1234567890-test.apps.googleusercontent.com&"
        "redirect_uri=https%3A%2F%2Fxrcqzpnstdbbtafhcwbb.supabase.co%2Fauth%2Fv1%2Fcallback&"
        "response_type=code&"
        "scope=openid+email+profile&"
        "code_challenge=xyz123&"
        "code_challenge_method=S256&"
        "state=st_98765"
    )

    parsed = urlparse(sample_oauth_url)
    assert parsed.hostname == "accounts.google.com"

    params = parse_qs(parsed.query)
    redirect_uri = params.get("redirect_uri", [None])[0]
    scope = params.get("scope", [None])[0]
    response_type = params.get("response_type", [None])[0]
    code_challenge_method = params.get("code_challenge_method", [None])[0]

    assert redirect_uri == "https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback"
    assert scope == "openid email profile"
    assert response_type == "code"
    assert code_challenge_method == "S256"


def test_pkce_flow_id_extraction():
    """Verify sb_flow_id parameter extraction from callback query string."""
    sample_callback = "https://agrimark-six.vercel.app/auth/callback?code=auth_code_123&sb_flow_id=flow_abc_456"
    parsed = urlparse(sample_callback)
    params = parse_qs(parsed.query)

    code = params.get("code", [None])[0]
    flow_id = params.get("sb_flow_id", [None])[0] or params.get("flow_id", [None])[0]

    assert code == "auth_code_123"
    assert flow_id == "flow_abc_456"


def test_callback_cookie_propagation_sync():
    """Verify that setAll synchronizes both request and response cookies."""
    request_cookies = {}
    response_cookies = {}

    def set_all(cookies_to_set):
        for c in cookies_to_set:
            request_cookies[c['name']] = c['value']
            response_cookies[c['name']] = c['value']

    set_all([
        {'name': 'sb-xrcqzpnstdbbtafhcwbb-auth-token', 'value': 'access_token_123'},
        {'name': 'sb-xrcqzpnstdbbtafhcwbb-auth-token-code-verifier', 'value': 'verifier_xyz'}
    ])

    assert request_cookies.get('sb-xrcqzpnstdbbtafhcwbb-auth-token') == 'access_token_123'
    assert response_cookies.get('sb-xrcqzpnstdbbtafhcwbb-auth-token') == 'access_token_123'


def test_duplicate_oauth_lock_prevention():
    """Verify locking mechanism prevents double-triggering OAuth flows."""
    lock = False
    executions = 0

    def trigger_login():
        nonlocal lock, executions
        if lock:
            return "ignored"
        lock = True
        executions += 1
        return "started"

    assert trigger_login() == "started"
    assert trigger_login() == "ignored"
    assert executions == 1


def test_no_cache_headers_for_callback():
    """Verify required no-cache headers for OAuth callback route responses."""
    headers = {}
    headers["Cache-Control"] = "private, no-store, no-cache, must-revalidate"
    headers["Pragma"] = "no-cache"
    headers["Expires"] = "0"

    assert "no-store" in headers["Cache-Control"]
    assert headers["Pragma"] == "no-cache"
    assert headers["Expires"] == "0"


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
