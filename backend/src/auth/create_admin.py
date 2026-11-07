"""Create or promote a superuser from environment variables.

Run from the `backend` directory:

    python -m src.auth.create_admin

Environment variables (read from the shell or backend/.env):
    ADMIN_EMAIL     Required. If this user exists, they are promoted.
    ADMIN_USERNAME  Required only when creating a new user.
    ADMIN_PASSWORD  Required only when creating a new user.

The command never prints the password. Existing users keep their password and
are only flipped to `is_superuser=True`.
"""

import asyncio
import sys

from pydantic import EmailStr, ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.exc import IntegrityError

from config import BASE_DIR
from database import AsyncSessionLocal, engine
from models import User
from src.auth.query import get_user_by_email, get_user_by_username
from src.auth.schema import RegisterRequest
from src.auth.security import hash_password


class AdminBootstrapSettings(BaseSettings):
    admin_email: EmailStr | None = None
    admin_username: str | None = None
    admin_password: str | None = None

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_prefix="",
        extra="ignore",
    )


def _error(message: str) -> None:
    print(message, file=sys.stderr)


def _print_validation_error(exc: ValidationError) -> None:
    _error("Invalid admin details:")
    for error in exc.errors():
        location = ".".join(str(part) for part in error["loc"])
        _error(f"  {location}: {error['msg']}")


async def _bootstrap() -> int:
    try:
        config = AdminBootstrapSettings()
    except ValidationError as exc:
        _print_validation_error(exc)
        return 2

    email = str(config.admin_email).lower() if config.admin_email else ""

    if not email:
        _error(
            "ADMIN_EMAIL is required. Set it in the environment or backend/.env."
        )
        return 2

    async with AsyncSessionLocal() as db:
        existing = await get_user_by_email(db, email)

        if existing is not None:
            if existing.is_superuser:
                print(f"{email} is already a superuser. Nothing to do.")
                return 0

            existing.is_superuser = True
            await db.commit()

            print(f"Promoted existing user {email} to superuser.")
            if not existing.is_active:
                _error(
                    "Note: this account is inactive, so it still cannot log in. "
                    "Reactivate it before using the admin UI."
                )
            return 0

        missing = [
            name
            for name, value in (
                ("ADMIN_USERNAME", config.admin_username),
                ("ADMIN_PASSWORD", config.admin_password),
            )
            if not value
        ]
        if missing:
            _error(
                f"{email} does not exist yet. To create it, set: "
                + ", ".join(missing)
            )
            return 2

        try:
            payload = RegisterRequest(
                username=config.admin_username,
                email=email,
                password=config.admin_password,
            )
        except ValidationError as exc:
            _print_validation_error(exc)
            return 2

        if await get_user_by_username(db, payload.username) is not None:
            _error(
                f"Username {payload.username!r} is already taken. "
                "Choose another ADMIN_USERNAME."
            )
            return 1

        user = User(
            username=payload.username,
            email=str(payload.email),
            hashed_password=hash_password(payload.password),
            is_superuser=True,
            is_active=True,
            balance_paisa=0,
        )
        db.add(user)

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            _error(
                "Could not create the admin because the username or email "
                "was registered concurrently."
            )
            return 1

        print(f"Created superuser {user.username} <{user.email}>.")
        return 0


async def main() -> int:
    try:
        return await _bootstrap()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
