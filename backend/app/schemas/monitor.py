from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from typing import Optional


class MonitorCreate(BaseModel):
    url: HttpUrl = Field(..., max_length=2048)
    # Interwał w minutach — min. 1, max. 1440 (24h), domyślnie 5
    interval_minutes: int = Field(default=5, ge=1, le=1440)


class MonitorUpdate(BaseModel):
    """Wszystkie pola opcjonalne — partial update przez PATCH."""
    url: Optional[HttpUrl] = Field(default=None, max_length=2048)
    interval_minutes: Optional[int] = Field(default=None, ge=1, le=1440)
    is_active: Optional[bool] = None


class MonitorResponse(BaseModel):
    id: int
    url: str
    interval_minutes: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Obsługa obiektów SQLAlchemy


class StatusMonitorResponse(BaseModel):
    """Publiczny widok monitora — bez wrażliwych danych (brak user_id, id)."""
    url: str
    is_up: Optional[bool]
    last_checked: Optional[datetime]
    uptime_24h: Optional[float]
    response_time_ms: Optional[int]

    class Config:
        from_attributes = True