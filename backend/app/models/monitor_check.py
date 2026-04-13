from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class MonitorCheck(Base):
    __tablename__ = "monitor_checks"

    id = Column(Integer, primary_key=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    status_code = Column(Integer, nullable=True)       # None jeśli brak odpowiedzi
    response_time_ms = Column(BigInteger, nullable=True)  # None jeśli timeout
    is_up = Column(Boolean, nullable=False)
    checked_at = Column(DateTime, default=datetime.utcnow)

    monitor = relationship("Monitor", back_populates="checks")