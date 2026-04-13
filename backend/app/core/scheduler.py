import httpx
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.monitor import Monitor
from app.models.monitor_check import MonitorCheck
from app.services.alert_service import send_alert

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Globalny scheduler — uruchamiany przez lifespan w main.py
scheduler = AsyncIOScheduler()


async def ping_monitor(monitor: Monitor, db: Session) -> None:
    """
    Odpytuje pojedynczy monitor przez HTTP GET.
    Zapisuje wynik do MonitorCheck i wysyła alert jeśli stan się zmienił.
    Serwis uznawany jest za DOWN jeśli status >= 500 lub brak odpowiedzi.
    """
    is_up = False
    status_code = None
    response_time_ms = None

    try:
        start = datetime.utcnow()
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(monitor.url)
        elapsed = (datetime.utcnow() - start).total_seconds() * 1000
        is_up = response.status_code < 500
        status_code = response.status_code
        response_time_ms = int(elapsed)
    except Exception as e:
        logger.warning(f"Monitor {monitor.id} ({monitor.url}) failed: {e}")

    # Pobierz poprzedni check do porównania stanu
    previous = db.query(MonitorCheck).filter(
        MonitorCheck.monitor_id == monitor.id
    ).order_by(MonitorCheck.checked_at.desc()).first()

    check = MonitorCheck(
        monitor_id=monitor.id,
        status_code=status_code,
        response_time_ms=response_time_ms,
        is_up=is_up,
        checked_at=datetime.utcnow()
    )
    db.add(check)
    db.commit()

    # Alert tylko przy zmianie stanu — nie przy pierwszym pingu
    state_changed = previous is not None and previous.is_up != is_up
    if state_changed:
        send_alert(db, monitor, is_up)

    logger.info(f"Monitor {monitor.id} ({monitor.url}) — is_up={is_up}, status={status_code}, time={response_time_ms}ms")


async def run_checks() -> None:
    """
    Główny job schedulera — odpala się co 60s.
    Pobiera aktywne monitory i pinguje te, którym minął interwał od ostatniego checku.
    """
    from sqlalchemy.orm import joinedload
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).options(
            joinedload(Monitor.user)  # eager load — potrzebne do wysyłki emaila
        ).filter(Monitor.is_active == True).all()  # noqa: E712

        for monitor in monitors:
            last_check = db.query(MonitorCheck).filter(
                MonitorCheck.monitor_id == monitor.id
            ).order_by(MonitorCheck.checked_at.desc()).first()

            # Pomiń jeśli nie minął jeszcze interwał monitora
            if last_check:
                elapsed = (datetime.utcnow() - last_check.checked_at).total_seconds()
                if elapsed < monitor.interval_minutes * 60:
                    continue

            await ping_monitor(monitor, db)
    finally:
        db.close()


def start_scheduler() -> None:
    """Rejestruje job i startuje scheduler. Wywoływany przez lifespan aplikacji."""
    scheduler.add_job(run_checks, "interval", seconds=60, id="monitor_checks")
    scheduler.start()
    logger.info("Scheduler started")


def stop_scheduler() -> None:
    """Zatrzymuje scheduler przy zamknięciu aplikacji."""
    scheduler.shutdown()
    logger.info("Scheduler stopped")