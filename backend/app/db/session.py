from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Silnik bazy — connection string z .env
engine = create_engine(settings.DATABASE_URL)

# Fabryka sesji — autocommit i autoflush wyłączone, commit ręczny
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency injection dla FastAPI — zwraca sesję bazy danych.
    Sesja jest zamykana po zakończeniu requestu niezależnie od wyniku.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()