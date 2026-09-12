def test_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_db_health_endpoint(client):
    response = client.get("/api/v1/health/db")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "dialect" in data


def test_production_database_fail_fast_safety():
    import pytest
    from backend.app.core.config import settings
    from backend.app.core.database import get_engine

    orig_env = settings.DATABASE_ENV
    orig_url = settings.DATABASE_URL
    try:
        settings.DATABASE_ENV = "production"
        settings.DATABASE_URL = "postgresql://invalid_user:invalid_pass@127.0.0.1:54321/invalid_db"
        with pytest.raises(RuntimeError) as exc_info:
            get_engine()
        assert "SQLite fallback is disabled in production" in str(exc_info.value)
    finally:
        settings.DATABASE_ENV = orig_env
        settings.DATABASE_URL = orig_url

