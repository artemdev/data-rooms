from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


def get_database_url():
    """
    Smart database URL detection:
    - Priority 1: DATABASE_URL (Railway production)
    - Priority 2: Build from individual env vars (docker-compose local)
    """
    # Check for DATABASE_URL first (Railway uses this)
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        # Railway provides postgres:// but SQLAlchemy needs postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return database_url

    # Fallback: Build from individual environment variables (local docker-compose)
    db_user = os.getenv("PG_USER", "postgres")
    db_password = os.getenv("PG_PASSWORD", "123456")
    db_host = os.getenv("PG_DOMAIN", "localhost")
    db_port = os.getenv("PG_PORT", "5432")
    db_name = os.getenv("PG_DB", "postgres")

    return f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


SQLALCHEMY_DATABASE_URL = get_database_url()
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a session instance for scripts like seed.py
session = SessionLocal()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()