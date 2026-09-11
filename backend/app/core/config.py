from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriMark Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENV: str = "development"
    DEBUG: bool = True

    # Database Standard: PostgreSQL / Supabase (xrcqzpnstdbbtafhcwbb)
    DATABASE_URL: str = "postgresql://postgres:postgres_pass@db.xrcqzpnstdbbtafhcwbb.supabase.co:5432/postgres"
    SUPABASE_URL: str = "https://xrcqzpnstdbbtafhcwbb.supabase.co"
    SUPABASE_ANON_KEY: str = "your-supabase-anon-key-here"
    SUPABASE_SERVICE_ROLE_KEY: str = "your-supabase-service-role-key-here"
    TEST_DATABASE_URL: str = "sqlite:///:memory:"

    # JWT Security
    SECRET_KEY: str = "agrimark_super_secret_jwt_key_change_in_production_environment_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
