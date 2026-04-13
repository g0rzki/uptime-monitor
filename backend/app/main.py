from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes import auth, monitors
import app.models.user  # noqa: F401
import app.models.monitor  # noqa: F401
import app.models.monitor_check  # noqa: F401
import app.models.alert  # noqa: F401

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Uptime Monitor API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(monitors.router)