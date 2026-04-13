import ipaddress
import socket
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.monitor import Monitor
from app.models.user import User
from app.schemas.monitor import MonitorCreate, MonitorUpdate

# Maksymalna liczba monitorów per konto
MONITOR_LIMIT = 20


def _validate_url(url: str) -> None:
    """
    Waliduje URL pod kątem bezpieczeństwa.
    Blokuje adresy prywatne, loopback i link-local — ochrona przed SSRF.
    """
    parsed = urlparse(url)
    hostname = parsed.hostname

    if not hostname:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid URL")

    try:
        ip = ipaddress.ip_address(socket.gethostbyname(hostname))
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="URL points to a private or reserved address"
            )
    except socket.gaierror:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve hostname"
        )


def get_monitors(db: Session, user: User) -> list[Monitor]:
    """Zwraca wszystkie monitory danego użytkownika."""
    return db.query(Monitor).filter(Monitor.user_id == user.id).all()


def get_monitor(db: Session, monitor_id: int, user: User) -> Monitor:
    """Zwraca monitor po ID. Rzuca 404 jeśli nie istnieje lub nie należy do usera."""
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == user.id
    ).first()
    if not monitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found")
    return monitor  # type: ignore


def create_monitor(db: Session, data: MonitorCreate, user: User) -> Monitor:
    """
    Tworzy nowy monitor po walidacji:
    - limit 20 monitorów per konto
    - brak duplikatów URL per konto
    - URL nie wskazuje na prywatny adres (SSRF)
    """
    count = db.query(Monitor).filter(Monitor.user_id == user.id).count()
    if count >= MONITOR_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Monitor limit reached ({MONITOR_LIMIT} per account)"
        )

    url = str(data.url)

    existing = db.query(Monitor).filter(
        Monitor.user_id == user.id,
        Monitor.url == url
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monitor for this URL already exists"
        )

    _validate_url(url)

    monitor = Monitor(user_id=user.id, url=url, interval_minutes=data.interval_minutes)
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    return monitor  # type: ignore


def update_monitor(db: Session, monitor_id: int, data: MonitorUpdate, user: User) -> Monitor:
    """Częściowa aktualizacja monitora. Waliduje URL jeśli się zmienia."""
    monitor = get_monitor(db, monitor_id, user)

    if data.url is not None:
        url = str(data.url)
        _validate_url(url)
        monitor.url = url
    if data.interval_minutes is not None:
        monitor.interval_minutes = data.interval_minutes
    if data.is_active is not None:
        monitor.is_active = data.is_active

    db.commit()
    db.refresh(monitor)
    return monitor  # type: ignore


def delete_monitor(db: Session, monitor_id: int, user: User) -> None:
    """Usuwa monitor. Checki usuwane przez cascade delete w modelu."""
    monitor = get_monitor(db, monitor_id, user)
    db.delete(monitor)
    db.commit()