import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from config import settings


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": str(user_id), "jti": secrets.token_urlsafe(16), "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    return jwt.encode(
        {
            "sub": str(user_id),
            "type": "refresh",
            "jti": secrets.token_urlsafe(16),
            "exp": expire,
        },
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_refresh_token(token: str) -> int:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    if payload.get("type") != "refresh":
        raise jwt.InvalidTokenError("Token is not a refresh token")
    return int(payload["sub"])


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# Verified against when the username doesn't exist, so an unknown user costs
# the same bcrypt work as a wrong password (no timing-based enumeration).
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(16))
