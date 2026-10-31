from fastapi import Response
import jwt
from src.auth.security import verify_password
from src.auth.schema import AuthUser
from src.auth.schema import LoginResponse
from src.auth.schema import LoginRequest
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


@auth_router.post("/login", response_model=LoginResponse, status_code=200)
async def login(body: Annotated[LoginRequest, Body()],response:Response, db: Annotated[AsyncSession, Depends(get_db)]):
    # check if username exists
    user = await get_user_by_username(db, body.username)
    if not user:
        return JSONResponse(
            status_code=404,
            content={"detail": "User not found"},
        )
    
    # check if password matches
    if not verify_password(body.password, user.hashed_password):
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid password"},
        )
    
    # create a jwt token 
    access_token = jwt.encode(payload={"sub": user.username}, key="secret", algorithm="HS256")

    # set the jwt token in the response header
    response.headers["Authorization"] = f"Bearer {access_token}"
    return LoginResponse(
        message="Login successful",
        user=AuthUser(
            username=user.username,
            email=user.email,
            is_superuser=user.is_superuser,
        ),
    )

@auth_router.get("/me", response_model=LoginResponse, status_code=200)
async def get_current_user(response: Response, db: Annotated[AsyncSession, Depends(get_db)]):
    # get the jwt token from the request header
    auth_header = response.headers.get("Authorization")
    if not auth_header:
        return JSONResponse(
            status_code=401,
            content={"detail": "Authorization header missing"},
        )
    
    # decode the jwt token
    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(token, key="secret", algorithms=["HS256"])
        username = payload.get("sub")
    except (IndexError, jwt.DecodeError):
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid token"},
        )
    
    # get the user from the database
    user = await get_user_by_username(db, username)
    if not user:
        return JSONResponse(
            status_code=404,
            content={"detail": "User not found"},
        )
    
    return LoginResponse(message=f"Current user: {user.username}")