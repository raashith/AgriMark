import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from backend.app.core.config import settings

logger = logging.getLogger("agrimark.database")

Base = declarative_base()


def get_engine():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("sqlite"):
            engine = create_engine(
                db_url,
                connect_args={"check_same_thread": False},
                poolclass=StaticPool
            )
        else:
            engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20
            )
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        return engine
    except Exception as e:
        if settings.ENV.lower() == "production" or settings.DATABASE_ENV.lower() == "production":
            logger.error(
                f"FATAL: Production DB Connection Failed ({db_url}): {e}. SQLite fallback is strictly prohibited in production."
            )
            raise RuntimeError(
                f"FATAL: Production PostgreSQL connection to {db_url} failed: {e}. SQLite fallback is disabled in production."
            ) from e

        logger.warning(
            f"Failed connecting to primary DB ({db_url}): {e}. Falling back to SQLite in-memory DB for local development/testing."
        )
        fallback_engine = create_engine(
            settings.TEST_DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        return fallback_engine


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
