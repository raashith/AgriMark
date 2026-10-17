from functools import lru_cache

from supabase import Client, create_client
from supabase.lib.client_options import ClientOptions

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()

    if settings.demo_mode:
        key = settings.supabase_publishable_key
        if not key:
            raise RuntimeError("Supabase publishable key is required for demo mode")
        options = ClientOptions(
            headers={"x-agrimark-demo-token": "agrimark-demo-token"},
            auto_refresh_token=False,
            persist_session=False,
        )
        return create_client(settings.supabase_url, key, options=options)

    # Use the service-role key only for private/profile writes. Public read
    # endpoints must work with the publishable key and remain governed by RLS.
    key = settings.supabase_service_role_key or settings.supabase_publishable_key
    if not key:
        raise RuntimeError("No Supabase server credential configured")
    return create_client(settings.supabase_url, key)


@lru_cache
def get_supabase_public() -> Client:
    """Least-privilege client for endpoints explicitly documented as public.

    Public routes must never fall back to the privileged server key. They use the
    Supabase publishable key and therefore remain constrained by anon RLS.
    """
    settings = get_settings()
    key = settings.supabase_publishable_key
    if not key:
        raise RuntimeError("Supabase publishable key is required for public operations")

    return create_client(settings.supabase_url, key)
