from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import func
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.monitor import Monitor
from app.models.monitor_check import MonitorCheck
from app.schemas.monitor import MonitorCreate, MonitorUpdate, MonitorResponse, StatusMonitorResponse
from app.schemas.check import CheckResponse
from app.services import monitor_service
from app.services.alert_service import send_alert

router = APIRouter(prefix="/monitors", tags=["monitors"])


@router.get("", response_model=list[MonitorResponse])
def get_monitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Zwraca listę wszystkich monitorów zalogowanego użytkownika."""
    return monitor_service.get_monitors(db, current_user)


@router.post("", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
def create_monitor(
    data: MonitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dodaje nowy monitor. Waliduje URL (SSRF), sprawdza limit 20 i duplikaty."""
    return monitor_service.create_monitor(db, data, current_user)


@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Zwraca szczegóły pojedynczego monitora. 404 jeśli nie należy do usera."""
    return monitor_service.get_monitor(db, monitor_id, current_user)


@router.patch("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: int,
    data: MonitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Częściowa aktualizacja monitora — URL, interwał lub status aktywności."""
    return monitor_service.update_monitor(db, monitor_id, data, current_user)


@router.delete("/{monitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Usuwa monitor wraz z historią checków (cascade delete)."""
    monitor_service.delete_monitor(db, monitor_id, current_user)


@router.get("/{monitor_id}/checks", response_model=list[CheckResponse])
def get_checks(
    monitor_id: int,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Historia pingów dla monitora z paginacją (limit/offset). Sortowanie od najnowszych."""
    monitor_service.get_monitor(db, monitor_id, current_user)
    checks = db.query(MonitorCheck).filter(
        MonitorCheck.monitor_id == monitor_id
    ).order_by(MonitorCheck.checked_at.desc()).limit(limit).offset(offset).all()
    return checks


@router.post("/{monitor_id}/test-alert", status_code=status.HTTP_200_OK)
def test_alert(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Wysyła testowy email DOWN dla danego monitora. Służy do weryfikacji konfiguracji Resend."""
    monitor = db.query(Monitor).options(
        joinedload(Monitor.user)
    ).filter(Monitor.id == monitor_id, Monitor.user_id == current_user.id).first()
    if not monitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found")
    send_alert(db, monitor, is_up=False)  # type: ignore
    return {"message": "Test alert sent"}


@router.get("/public/status", response_model=list[StatusMonitorResponse], include_in_schema=True)
def get_public_status(db: Session = Depends(get_db)):
    """
    Publiczny endpoint statusów — nie wymaga JWT.
    Zwraca tylko aktywne monitory konta demo z ostatnim statusem i uptime za 24h.
    """
    from app.api.deps import DEMO_EMAIL
    from app.models.user import User as UserModel

    demo_user = db.query(UserModel).filter(UserModel.email == DEMO_EMAIL).first()
    if not demo_user:
        return []

    monitors = db.query(Monitor).filter(
        Monitor.user_id == demo_user.id,
        Monitor.is_active == True  # noqa: E712
    ).all()

    result = []
    for monitor in monitors:
        # Ostatni check — aktualny status
        last_check = db.query(MonitorCheck).filter(
            MonitorCheck.monitor_id == monitor.id
        ).order_by(MonitorCheck.checked_at.desc()).first()

        # Uptime za ostatnie 24h — procent udanych pingów
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(hours=24)
        total = db.query(func.count(MonitorCheck.id)).filter(
            MonitorCheck.monitor_id == monitor.id,
            MonitorCheck.checked_at >= cutoff
        ).scalar()
        up = db.query(func.count(MonitorCheck.id)).filter(
            MonitorCheck.monitor_id == monitor.id,
            MonitorCheck.checked_at >= cutoff,
            MonitorCheck.is_up == True  # noqa: E712
        ).scalar()

        uptime_pct = round((up / total * 100), 1) if total > 0 else None

        result.append(StatusMonitorResponse(
            url=str(monitor.url),
            is_up=last_check.is_up if last_check else None,
            last_checked=last_check.checked_at if last_check else None,
            uptime_24h=uptime_pct,
            response_time_ms=last_check.response_time_ms if last_check else None,
        ))

    return result