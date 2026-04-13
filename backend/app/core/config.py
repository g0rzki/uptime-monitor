from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Baza danych
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h

    # Email — Resend API
    RESEND_API_KEY: str = ""
    MAIL_FROM: str = "onboarding@resend.dev"

    # Scheduler
    REQUEST_TIMEOUT_SECONDS: int = 10   # timeout HTTP ping
    DEFAULT_MONITOR_INTERVAL: int = 5   # domyślny interwał w minutach

    class Config:
        # .env znajduje się w root repo (poziom wyżej niż backend/)
        env_file = "../.env"


@lru_cache
def get_settings() -> Settings:
    """Singleton ustawień — wczytywany raz, cachowany przez lru_cache."""
    return Settings()


# Globalny obiekt ustawień do importu w całej aplikacji
settings = get_settings()