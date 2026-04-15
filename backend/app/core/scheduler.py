import httpx
import logging
import asyncio
from datetime import datetime
from urllib.parse import urlparse
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

# Liczba prób przed uznaniem monitora za DOWN — chroni przed false positives
RETRY_COUNT = 3
# Przerwa między próbami w sekundach
RETRY_DELAY_SECONDS = 5
# Bufor czasowy (s) — scheduler odpala się co 60s, bufor eliminuje systematyczne dryfowanie interwału
INTERVAL_BUFFER_SECONDS = 30


def mask_url(url: str) -> str:
    """Maskuje query string w URL przed logowaniem — chroni tokeny i klucze API w URLach."""
    parsed = urlparse(url)
    if parsed.query:
        return parsed._replace(query="***").geturl()
    return url


async def ping_once(url: str) -> tuple[bool, int | None, int | None]:
    """
    Pojedyncze odpytanie URL przez HTTP stream — pobiera tylko nagłówki, ignoruje body.
    Zapobiega ładowaniu całej odpowiedzi do pamięci (ochrona przed OOM przy dużych stronach).
    Zwraca (is_up, status_code, response_time_ms).
    Serwis uznawany jest za DOWN jeśli status >= 500 lub brak odpowiedzi.
    """
    try:
        start = datetime.utcnow()
        async with httpx.AsyncClient(timeout=10) as client:
            async with client.stream("GET", url) as response:
                status_code = response.status_code
        elapsed = (datetime.utcnow() - start).total_seconds() * 1000
        is_up = status_code < 500
        return is_up, status_code, int(elapsed)
    except Exception as e:
        logger.warning(f"Ping failed for {mask_url(url)}: {e}")
        return False, None, None


async def ping_monitor(monitor: Monitor, db: Session) -> None:
    """
    Odpytuje pojedynczy monitor z retry logic.
    Monitor uznawany jest za DOWN dopiero po RETRY_COUNT nieudanych próbach z rzędu —
    chroni przed false positives spowodowanymi chwilowymi problemami sieciowymi.
    Zapisuje wynik ostatniej próby do MonitorCheck i wysyła alert jeśli stan się zmienił.
    """
    is_up, status_code, response_time_ms = await ping_once(monitor.url)

    # Retry — tylko jeśli pierwsza próba nie powiodła się
    if not is_up:
        for attempt in range(1, RETRY_COUNT):
            logger.info(f"Monitor {monitor.id} ({mask_url(monitor.url)}) — retry {attempt}/{RETRY_COUNT - 1}")
            await asyncio.sleep(RETRY_DELAY_SECONDS)
            is_up, status_code, response_time_ms = await ping_once(monitor.url)
            if is_up:
                break  # Serwis odpowiedział — nie ma potrzeby dalszych prób

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

    logger.info(f"Monitor {monitor.id} ({mask_url(monitor.url)}) — is_up={is_up}, status={status_code}, time={response_time_ms}ms")


async def run_checks() -> None:
    """
    Główny job schedulera — odpala się co 60s.
    Pobiera aktywne monitory i pinguje te, którym minął interwał od ostatniego checku.
    Bufor INTERVAL_BUFFER_SECONDS zapobiega systematycznemu dryfowaniu interwału
    wynikającemu z granularności schedulera (60s).
    """
    from sqlalchemy.orm import joinedload
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).options(
            joinedload(Monitor.user)
        ).filter(Monitor.is_active == True).all()  # noqa: E712

        for monitor in monitors:
            last_check = db.query(MonitorCheck).filter(
                MonitorCheck.monitor_id == monitor.id
            ).order_by(MonitorCheck.checked_at.desc()).first()

            # Pomiń jeśli nie minął jeszcze interwał monitora (z buforem)
            if last_check:
                elapsed = (datetime.utcnow() - last_check.checked_at).total_seconds()
                if elapsed < (monitor.interval_minutes * 60) - INTERVAL_BUFFER_SECONDS:
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