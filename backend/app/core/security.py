import bcrypt
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hashuje hasło przy użyciu bcrypt. Passlib niekompatybilny z Python 3.14."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Porównuje hasło plaintext z hashem bcrypt."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict) -> str:
    """Tworzy JWT z payload i czasem wygaśnięcia z konfiguracji."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)