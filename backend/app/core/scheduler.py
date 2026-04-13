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
scheduler = AsyncIOScheduler()


async def ping_monitor(monitor: Monitor, db: Session) -> None:
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

    state_changed = previous is None or previous.is_up != is_up

    if state_changed:
        send_alert(db, monitor, is_up)

    logger.info(f"Monitor {monitor.id} ({monitor.url}) — is_up={is_up}, status={status_code}, time={response_time_ms}ms")


async def run_checks() -> None:
    from sqlalchemy.orm import joinedload
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).options(
            joinedload(Monitor.user)
        ).filter(Monitor.is_active == True).all()  # noqa: E712
        for monitor in monitors:
            await ping_monitor(monitor, db)
    finally:
        db.close()


def start_scheduler() -> None:
    scheduler.add_job(run_checks, "interval", seconds=60, id="monitor_checks")
    scheduler.start()
    logger.info("Scheduler started")


def stop_scheduler() -> None:
    scheduler.shutdown()
    logger.info("Scheduler stopped")