from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio.session import AsyncSession

from config import settings
from models import RefreshToken, User
from src.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_token,
)


class InvalidRefreshToken(Exception):
    """Raised when a refresh token is missing, expired, revoked or reused."""


def _aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _refresh_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )


async def issue_tokens(db: AsyncSession, user: User) -> tuple[str, str]:
    """Creates an access/refresh pair and persists the refresh token hash."""
    now = datetime.now(timezone.utc)
    # Drop this user's expired rows so the table doesn't grow forever.
    await db.execute(
        delete(RefreshToken).where(
            RefreshToken.user_id == user.id, RefreshToken.expires_at < now
        )
    )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=_refresh_expiry(),
        )
    )
    await db.flush()
    return access_token, refresh_token


async def _get_stored_token(db: AsyncSession, raw_token: str) -> RefreshToken | None:
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == hash_token(raw_token))
    )
    return result.scalars().first()


async def rotate_refresh_token(
    db: AsyncSession, raw_token: str
) -> tuple[User, str, str]:
    """Validates and revokes the old refresh token, then issues a new pair."""
    try:
        user_id = decode_refresh_token(raw_token)
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise InvalidRefreshToken from None

    stored = await _get_stored_token(db, raw_token)
    now = datetime.now(timezone.utc)
    if (
        stored is None
        or stored.revoked_at is not None
        or _aware(stored.expires_at) <= now
        or stored.user_id != user_id
    ):
        raise InvalidRefreshToken

    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise InvalidRefreshToken

    stored.revoked_at = now
    access_token, refresh_token = await issue_tokens(db, user)
    return user, access_token, refresh_token


async def revoke_refresh_token(db: AsyncSession, raw_token: str) -> None:
    stored = await _get_stored_token(db, raw_token)
    if stored is not None and stored.revoked_at is None:
        stored.revoked_at = datetime.now(timezone.utc)
