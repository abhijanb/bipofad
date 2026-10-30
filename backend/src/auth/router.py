from src.auth.schema import EmailConflictResponse
from src.auth.schema import UsernameConflictResponse
from fastapi.concurrency import run_in_threadpool
from src.auth.security import hash_password
from src.auth.query import get_user_by_username
from src.auth.query import get_user_by_email
from src.auth.query import suggested_username
from src.auth.query import suggested_email
from src.auth.mutation import save_user
from src.auth.schema import RegisterResponse
from src.auth.schema import RegisterRequest
from database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from fastapi import Body
from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

auth_router = APIRouter(prefix="/auth", tags=["auth"])

CONFLICT_DETAIL = "Username or email already registered"

@auth_router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
    responses={409: {"model": UsernameConflictResponse}},
)
async def register(body: Annotated[RegisterRequest, Body()], 
             db: Annotated[AsyncSession, Depends(get_db)]) -> RegisterResponse:
    
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
