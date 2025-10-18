from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    debug: bool = True

print(Settings().debug)