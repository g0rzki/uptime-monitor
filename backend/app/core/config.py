from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    RESEND_API_KEY: str = ""
    MAIL_FROM: str = "onboarding@resend.dev"

    REQUEST_TIMEOUT_SECONDS: int = 10
    DEFAULT_MONITOR_INTERVAL: int = 5

    class Config:
        env_file = "../.env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()