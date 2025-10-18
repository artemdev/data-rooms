from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PG_DB: str
    PG_USER: str
    PG_PASSWORD: str
    PG_DOMAIN: str
    PG_PORT: str
    DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=".env")

    @field_validator('DATABASE_URL', mode='before')
    @classmethod
    def expand_database_url(cls, v, info):
        if isinstance(v, str) and '{' in v:
            # Get the data that's been validated so far
            data = info.data
            return v.format(
                PG_USER=data.get('PG_USER', ''),
                PG_PASSWORD=data.get('PG_PASSWORD', ''),
                PG_DOMAIN=data.get('PG_DOMAIN', ''),
                PG_PORT=data.get('PG_PORT', ''),
                PG_DB=data.get('PG_DB', '')
            )
        return v

settings = Settings()