from functools import lru_cache

import httpx
from supabase import Client, create_client
from supabase.lib.client_options import ClientOptions

from .config import get_settings


@lru_cache
def get_supabase() -> Client:
    settings = get_settings()
    key = settings.supabase_service_role_key
    if not key:
        raise RuntimeError("Supabase service role key is required for server-side operations")

    timeout = httpx.Timeout(30.0, connect=10.0)
    options = ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
        postgrest_client_timeout=timeout,
        storage_client_timeout=timeout,
    )
    return create_client(settings.supabase_url, key, options=options)
