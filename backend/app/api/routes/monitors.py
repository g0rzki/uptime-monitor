from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.monitor import MonitorCreate, MonitorUpdate, MonitorResponse
from app.schemas.check import CheckResponse
from app.services import monitor_service

router = APIRouter(prefix="/monitors", tags=["monitors"])


@router.get("", response_model=list[MonitorResponse])
def get_monitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return monitor_service.get_monitors(db, current_user)


@router.post("", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
def create_monitor(
    data: MonitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return monitor_service.create_monitor(db, data, current_user)


@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return monitor_service.get_monitor(db, monitor_id, current_user)


@router.patch("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: int,
    data: MonitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return monitor_service.update_monitor(db, monitor_id, data, current_user)


@router.delete("/{monitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor_service.delete_monitor(db, monitor_id, current_user)


@router.get("/{monitor_id}/checks", response_model=list[CheckResponse])
def get_checks(
    monitor_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor_service.get_monitor(db, monitor_id, current_user)
    from app.models.monitor_check import MonitorCheck
    checks = db.query(MonitorCheck).filter(
        MonitorCheck.monitor_id == monitor_id
    ).order_by(MonitorCheck.checked_at.desc()).limit(limit).offset(offset).all()
    return checks