from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AgriMark API"
    environment: str = "production"
    supabase_url: str
    supabase_service_role_key: str | None = None
    supabase_publishable_key: str | None = None
    openai_api_key: str | None = None
    cors_origins: str = "https://agrimark-six.vercel.app,http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
