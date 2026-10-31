from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Body, Depends
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio.session import AsyncSession

from config import settings
from database import get_db
from models import User
from src.auth.dependencies import get_current_user as get_authenticated_user
from src.auth.mutation import save_user
from src.auth.query import (
    get_user_by_email,
    get_user_by_username,
    suggested_email,
    suggested_username,
)
from src.auth.schema import (
    AuthUser,
    EmailConflictResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    UsernameConflictResponse,
)
from src.auth.security import (
    DUMMY_PASSWORD_HASH,
    hash_password,
    verify_password,
)
from src.auth.tokens import (
    InvalidRefreshToken,
    issue_tokens,
    revoke_refresh_token,
    rotate_refresh_token,
)

auth_router = APIRouter(prefix="/auth", tags=["auth"])

CONFLICT_DETAIL = "Username or email already registered"
INVALID_CREDENTIALS = "Invalid username or password"


def _auth_user(user: User) -> AuthUser:
    return AuthUser(
        username=user.username,
        email=user.email,
        is_superuser=user.is_superuser,
    )


def _as_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


@auth_router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
    responses={409: {"model": UsernameConflictResponse}},
)
async def register(
    body: Annotated[RegisterRequest, Body()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RegisterResponse:
    # check if username already exists
    username_existing = await get_user_by_username(db, body.username)
    if username_existing:
        # suggest a new username available
        return JSONResponse(
            status_code=409,
            content=UsernameConflictResponse(
                detail=CONFLICT_DETAIL,
                suggested_usernames=[await suggested_username(body.username, db)],
            ).model_dump(),
        )

    # check if email already exists
    email_existing = await get_user_by_email(db, body.email)
    if email_existing:
        # suggest a new email available
        return JSONResponse(
            status_code=409,
            content=EmailConflictResponse(
                detail=CONFLICT_DETAIL,
                suggested_email=[await suggested_email(body.email, db)],
            ).model_dump(),
        )

    # hash the password
    hashed_password = await run_in_threadpool(hash_password, body.password)

    # create new user
    await save_user(db, body, hashed_password)

    return RegisterResponse(message="User registered successfully")


@auth_router.post("/login", response_model=LoginResponse, status_code=200)
async def login(
    body: Annotated[LoginRequest, Body()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await get_user_by_username(db, body.username)
    if not user:
        # Do the same bcrypt work as a real check so response time doesn't
        # reveal whether the username exists. bcrypt is CPU-bound, so keep it
        # off the event loop.
        await run_in_threadpool(verify_password, body.password, DUMMY_PASSWORD_HASH)
        return JSONResponse(
            status_code=401,
            content={"detail": INVALID_CREDENTIALS},
        )

    now = datetime.now(timezone.utc)
    if user.locked_until is not None and _as_aware(user.locked_until) > now:
        minutes = max(
            1,
            int((_as_aware(user.locked_until) - now).total_seconds() // 60) + 1,
        )
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Account temporarily locked. Try again in {minutes} minutes."
            },
        )

    if not user.is_active:
        return JSONResponse(
            status_code=403,
            content={"detail": "Account is disabled"},
        )

    password_ok = await run_in_threadpool(
        verify_password, body.password, user.hashed_password
    )
    if not password_ok:
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= settings.login_max_attempts:
            user.failed_login_attempts = 0
            user.locked_until = now + timedelta(
                minutes=settings.login_lockout_minutes
            )
        await db.flush()
        return JSONResponse(
            status_code=401,
            content={"detail": INVALID_CREDENTIALS},
        )

    user.failed_login_attempts = 0
    user.locked_until = None
    await db.flush()

    access_token, refresh_token = await issue_tokens(db, user)

    return LoginResponse(
        message="Login successful",
        access_token=access_token,
        refresh_token=refresh_token,
        user=_auth_user(user),
    )


@auth_router.post("/refresh", response_model=LoginResponse, status_code=200)
async def refresh(
    body: Annotated[RefreshRequest, Body()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        user, access_token, refresh_token = await rotate_refresh_token(
            db, body.refresh_token
        )
    except InvalidRefreshToken:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or expired refresh token"},
        )

    return LoginResponse(
        message="Token refreshed",
        access_token=access_token,
        refresh_token=refresh_token,
        user=_auth_user(user),
    )


@auth_router.post("/logout", status_code=204)
async def logout(
    body: Annotated[LogoutRequest, Body()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    await revoke_refresh_token(db, body.refresh_token)


@auth_router.get("/me", response_model=MeResponse, status_code=200)
async def me(
    user: Annotated[User, Depends(get_authenticated_user)],
) -> MeResponse:
    return MeResponse(message="Current user", user=_auth_user(user))
