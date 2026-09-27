from functools import lru_cache

from supabase import Client, create_client

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    key = settings.supabase_service_role_key
    if not key:
        raise RuntimeError("Supabase service role key is required for server-side operations")

    return create_client(settings.supabase_url, key)
