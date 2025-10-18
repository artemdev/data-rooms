from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Build connection string from environment variables
db_user = os.getenv("PG_USER", "postgres")
db_password = os.getenv("PG_PASSWORD", "123456")
db_host = os.getenv("PG_DOMAIN", "localhost")
db_port = os.getenv("PG_PORT", "5432")
db_name = os.getenv("PG_DB", "postgres")

SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()