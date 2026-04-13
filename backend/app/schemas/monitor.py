from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional


class MonitorCreate(BaseModel):
    url: HttpUrl
    interval_minutes: Optional[int] = 5  # Domyślny interwał: 5 minut


class MonitorUpdate(BaseModel):
    """Wszystkie pola opcjonalne — partial update przez PATCH."""
    url: Optional[HttpUrl] = None
    interval_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class MonitorResponse(BaseModel):
    id: int
    url: str
    interval_minutes: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Obsługa obiektów SQLAlchemy