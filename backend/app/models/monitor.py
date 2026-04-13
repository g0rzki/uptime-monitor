from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String, nullable=False)
    interval_minutes = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacja do właściciela — używana przy wysyłce alertów (monitor.user.email)
    user = relationship("User", back_populates="monitors")

    # Cascade delete — usunięcie monitora usuwa jego checki i alerty
    checks = relationship("MonitorCheck", back_populates="monitor", cascade="all, delete")
    alerts = relationship("Alert", back_populates="monitor", cascade="all, delete")