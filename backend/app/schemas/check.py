from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CheckResponse(BaseModel):
    id: int
    status_code: Optional[int]       # None jeśli brak odpowiedzi (timeout)
    response_time_ms: Optional[int]  # None jeśli timeout
    is_up: bool
    checked_at: datetime

    class Config:
        from_attributes = True  # Obsługa obiektów SQLAlchemy