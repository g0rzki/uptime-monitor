from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler  # noqa: PLC2701
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes import auth, monitors
from app.core.scheduler import start_scheduler, stop_scheduler

# Rejestracja modeli SQLAlchemy — wymagane żeby mapper widział wszystkie encje
import app.models.user  # noqa: F401
import app.models.monitor  # noqa: F401
import app.models.monitor_check  # noqa: F401
import app.models.alert  # noqa: F401

# Rate limiter — klucz per IP, obsługa błędu 429
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle aplikacji — scheduler startuje przy uruchomieniu, zatrzymuje się przy zamknięciu."""
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Uptime Monitor API", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — lokalnie Vite dev server, na produkcji podmienić na właściwą domenę
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://uptime-monitor-sepia.vercel.app",
        "https://uptime-monitor-g0rzkis-projects.vercel.app",
        "https://uptime-monitor-git-main-g0rzkis-projects.vercel.app",
        "https://monitor.gorzkiewicz.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(monitors.router)

@app.get("/health")
async def health():
    """Endpoint liveness check — używany przez Railway i monitoring zewnętrzny."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}