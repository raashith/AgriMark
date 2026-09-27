from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AgriMark API"
    environment: str = "production"
    supabase_url: str = "https://xrcqzpnstdbbtafhcwbb.supabase.co"

    supabase_service_role_key: str | None = None
    supabase_publishable_key: str | None = None

    firebase_project_id: str | None = None
    firebase_service_account_json: str | None = None
    firebase_service_account_json_base64: str | None = None

    cors_origins: str = (
        "https://agrimark.com,https://www.agrimark.com,https://agrimark-six.vercel.app,"
        "https://agrimark-git-main-sheik-raashith.vercel.app,"
        "https://agrimark-git-fix-firebase-auth-migration-sheik-raashith.vercel.app,"
        "https://agrimark-sheik-raashith.vercel.app,"
        "https://agrimark-stitch-web.onrender.com,http://localhost:5173,http://localhost:3000,http://localhost:3001"
    )
    cors_origin_regex: str = (
        r"^https://(www\.)?agrimark\.com$|"
        r"^https://agrimark[a-zA-Z0-9-]*\.vercel\.app$|"
        r"^https://agrimark-stitch-web\.onrender\.com$|"
        r"^http://localhost:\d+$"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
