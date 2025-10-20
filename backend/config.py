from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    DATABASE_URL: str = 'postgresql://111:111@postgres:5432/abc'
    REDIS_DOMAIN: str = 'redis'
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "000000"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()