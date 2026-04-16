from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler  # noqa: PLC2701
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes import auth, monitors, users
from app.core.scheduler import start_scheduler, stop_scheduler
import psutil
import os

# Rejestracja modeli SQLAlchemy — wymagane żeby mapper widział wszystkie encje
import app.models.user  # noqa: F401
import app.models.monitor  # noqa: F401
import app.models.monitor_check  # noqa: F401
import app.models.alert  # noqa: F401

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Dodaje nagłówki bezpieczeństwa HTTP do każdej odpowiedzi."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


# Rate limiter — klucz per IP, obsługa błędu 429
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle aplikacji — scheduler startuje przy uruchomieniu, zatrzymuje się przy zamknięciu."""
    start_scheduler()
    yield
    await stop_scheduler()


app = FastAPI(title="Uptime Monitor API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)

# CORS — lokalnie Vite dev server, na produkcji własne domeny
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://monitor.gorzkiewicz.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(monitors.router)
app.include_router(users.router)


@app.get("/health")
async def health():
    """Endpoint liveness check — używany przez Render i monitoring zewnętrzny."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/metrics")
async def metrics():
    """
    Statystyki runtime aplikacji — RAM, CPU, uptime procesu.
    Używany do monitorowania zużycia zasobów na Render (brak metryk w UI darmowego tieru).
    """
    process = psutil.Process(os.getpid())
    mem = process.memory_info()
    cpu_times = process.cpu_times()
    uptime_seconds = datetime.now(timezone.utc).timestamp() - process.create_time()
    uptime_hours = round(uptime_seconds / 3600, 2)
    vm = psutil.virtual_memory()

    return {
        "process": {
            "ram_rss_mb": round(mem.rss / 1024 / 1024, 1),
            "ram_vms_mb": round(mem.vms / 1024 / 1024, 1),
            "cpu_user_s": round(cpu_times.user, 2),
            "cpu_system_s": round(cpu_times.system, 2),
            "uptime_hours": uptime_hours,
            "pid": os.getpid(),
        },
        "system": {
            "ram_total_mb": round(vm.total / 1024 / 1024, 1),
            "ram_used_mb": round(vm.used / 1024 / 1024, 1),
            "ram_available_mb": round(vm.available / 1024 / 1024, 1),
            "ram_percent": vm.percent,
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }