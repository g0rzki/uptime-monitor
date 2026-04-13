import resend
import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.alert import Alert
from app.models.monitor import Monitor

logger = logging.getLogger(__name__)


def _already_alerted(db: Session, monitor_id: int, reason: str) -> bool:
    """
    Sprawdza czy ostatni alert dla tego monitora ma ten sam powód.
    Zapobiega spamowaniu emailami przy kolejnych failach tego samego typu.
    """
    last = db.query(Alert).filter(
        Alert.monitor_id == monitor_id
    ).order_by(Alert.sent_at.desc()).first()

    if not last:
        return False
    return last.reason == reason


def send_alert(db: Session, monitor: Monitor, is_up: bool) -> None:
    """
    Wysyła email przez Resend API jeśli stan monitora się zmienił.
    Zapisuje Alert do bazy po udanej wysyłce.
    Nie rzuca wyjątku przy błędzie — loguje i kontynuuje.
    """
    reason = "UP" if is_up else "DOWN"

    if _already_alerted(db, monitor.id, reason):
        logger.info(f"Alert already sent for monitor {monitor.id} ({reason}) — skipping")
        return

    subject = f"✅ {monitor.url} wrócił do działania" if is_up else f"🔴 {monitor.url} nie odpowiada"
    body = _build_email(monitor.url, is_up)

    try:
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": settings.MAIL_FROM,
            "to": monitor.user.email,
            "subject": subject,
            "html": body,
        })

        alert = Alert(monitor_id=monitor.id, reason=reason)
        db.add(alert)
        db.commit()
        logger.info(f"Alert sent for monitor {monitor.id} — {reason}")

    except Exception as e:
        logger.error(f"Failed to send alert for monitor {monitor.id}: {e}")


def _build_email(url: str, is_up: bool) -> str:
    """Buduje treść emaila HTML dla alertu UP lub DOWN."""
    if is_up:
        color = "#16a34a"
        label = "DZIAŁA"
        message = "Serwis powrócił do pełnej dostępności."
    else:
        color = "#dc2626"
        label = "NIEDOSTĘPNY"
        message = "Serwis nie odpowiada. Sprawdź jego status."

    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: {color};">{url}</h2>
        <p style="font-size: 18px; font-weight: bold; color: {color};">{label}</p>
        <p style="color: #555;">{message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="font-size: 12px; color: #999;">Uptime Monitor — gorzkiewicz.dev</p>
    </div>
    """