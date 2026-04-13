from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    reason = Column(String, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    monitor = relationship("Monitor", back_populates="alerts")