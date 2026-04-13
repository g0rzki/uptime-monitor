from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CheckResponse(BaseModel):
    id: int
    status_code: Optional[int]
    response_time_ms: Optional[int]
    is_up: bool
    checked_at: datetime

    class Config:
        from_attributes = True