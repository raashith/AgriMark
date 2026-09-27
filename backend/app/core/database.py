from functools import lru_cache

from supabase import Client, create_client
from supabase.client import ClientOptions

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    key = settings.supabase_service_role_key
    if not key:
        raise RuntimeError("Supabase service role key is required for server-side operations")

    options = ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
        postgrest_client_timeout=30,
        storage_client_timeout=30,
    )
    return create_client(settings.supabase_url, key, options=options)
