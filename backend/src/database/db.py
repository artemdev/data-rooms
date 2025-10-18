from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from config import settings

engine = create_engine(settings.DATABASE_URL)
#
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#
# # Create a session instance for scripts like seed.py
session = SessionLocal()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
