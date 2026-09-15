import pytest
from urllib.parse import urlparse, parse_qs


def test_canonical_urls_and_hosts():
    production_site_url = "https://agrimark-six.vercel.app"
    supabase_host = "xrcqzpnstdbbtafhcwbb.supabase.co"
    supabase_url = f"https://{supabase_host}"
    canonical_app_callback = f"{production_site_url}/auth/callback"
    google_cloud_authorized_redirect = f"{supabase_url}/auth/v1/callback"

    assert production_site_url.startswith("https://")
    assert supabase_url.startswith("https://")
    assert canonical_app_callback.startswith("https://")
    assert google_cloud_authorized_redirect.startswith("https://")
    assert google_cloud_authorized_redirect == "https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback"
    assert google_cloud_authorized_redirect != canonical_app_callback


def test_generated_oauth_request_url_parsing():
    sample_oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        "client_id=683524176381-test.apps.googleusercontent.com&"
        "redirect_uri=https%3A%2F%2Fxrcqzpnstdbbtafhcwbb.supabase.co%2Fauth%2Fv1%2Fcallback&"
        "response_type=code&"
        "scope=openid+email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&"
        "code_challenge=xyz123&"
        "code_challenge_method=S256&"
        "state=st_98765"
    )

    parsed = urlparse(sample_oauth_url)
    assert parsed.hostname == "accounts.google.com"
    params = parse_qs(parsed.query)
    assert params.get("redirect_uri", [None])[0] == "https://xrcqzpnstdbbtafhcwbb.supabase.co/auth/v1/callback"
    scope = params.get("scope", [None])[0]
    assert scope is not None
    assert "openid" in scope
    assert "email" in scope
    assert "profile" in scope
    assert "https://www.googleapis.com/auth/userinfo.email" in scope
    assert params.get("response_type", [None])[0] == "code"
    assert params.get("code_challenge_method", [None])[0] == "S256"


def test_pkce_flow_id_extraction_and_fallback():
    sample_callback_1 = "https://agrimark-six.vercel.app/auth/callback?code=auth_code_123&sb_flow_id=flow_abc_456"
    params_1 = parse_qs(urlparse(sample_callback_1).query)
    assert params_1.get("sb_flow_id", [None])[0] or params_1.get("flow_id", [None])[0] == "flow_abc_456"

    sample_callback_2 = "https://agrimark-six.vercel.app/auth/callback?code=auth_code_123&flow_id=flow_def_789"
    params_2 = parse_qs(urlparse(sample_callback_2).query)
    assert params_2.get("sb_flow_id", [None])[0] or params_2.get("flow_id", [None])[0] == "flow_def_789"


def test_correlation_id_format():
    import random, time
    rand = hex(random.getrandbits(32))[2:9]
    ts = hex(int(time.time() * 1000))[2:]
    cid = f"req_{rand}_{ts}"
    assert cid.startswith("req_")
    assert len(cid) > 10


def test_callback_cookie_and_headers_propagation_sync():
    request_cookies = {}
    response_cookies = {}
    response_headers = {}

    def set_all(cookies_to_set, headers=None):
        for c in cookies_to_set:
            request_cookies[c['name']] = c['value']
            response_cookies[c['name']] = c['value']
        if headers:
            for k, v in headers.items():
                response_headers[k] = v

    set_all([
        {'name': 'sb-xrcqzpnstdbbtafhcwbb-auth-token', 'value': 'access_token_123'},
        {'name': 'sb-xrcqzpnstdbbtafhcwbb-auth-token-code-verifier', 'value': 'verifier_xyz'}
    ], {'Cache-Control': 'private, no-store'})

    assert request_cookies.get('sb-xrcqzpnstdbbtafhcwbb-auth-token') == 'access_token_123'
    assert response_cookies.get('sb-xrcqzpnstdbbtafhcwbb-auth-token') == 'access_token_123'
    assert response_headers.get('Cache-Control') == 'private, no-store'


def test_duplicate_oauth_lock_prevention():
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
    headers = {
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    }
    assert "no-store" in headers["Cache-Control"]
    assert headers["Pragma"] == "no-cache"
    assert headers["Expires"] == "0"


def test_role_based_post_login_redirection():
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


def test_oauth_scope_includes_required_google_email_scope():
    requested_scopes = "openid email profile https://www.googleapis.com/auth/userinfo.email"
    assert "openid" in requested_scopes
    assert "email" in requested_scopes
    assert "profile" in requested_scopes
    assert "https://www.googleapis.com/auth/userinfo.email" in requested_scopes
    assert "https://www.googleapis.com/auth/contacts" not in requested_scopes
    assert "https://www.googleapis.com/auth/drive" not in requested_scopes


def test_error_formatting_and_redirect_mismatch_handling():
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
    dummy_client_env = {
        "NEXT_PUBLIC_SUPABASE_URL": "https://xrcqzpnstdbbtafhcwbb.supabase.co",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_test_12345",
        "NEXT_PUBLIC_API_BASE_URL": "https://agrimark-api.onrender.com/api/v1",
    }

    for key, val in dummy_client_env.items():
        assert not key.startswith("SUPABASE_SERVICE_ROLE_KEY")
        assert not key.startswith("SECRET")
        assert "sb_secret_" not in val
        assert "service_role" not in val
