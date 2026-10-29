from fastapi.concurrency import run_in_threadpool
from fastapi import HTTPException
from src.auth.security import hash_password
from src.auth.query import get_user_by_username
from src.auth.query import get_user_by_email
from src.auth.mutation import save_user
from src.auth.schema import RegisterResponse
from src.auth.schema import RegisterRequest
from database import get_db
from sqlalchemy.ext.asyncio.session import AsyncSession
from fastapi import Body
from typing import Annotated
from fastapi import APIRouter, Depends

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(body: Annotated[RegisterRequest, Body()], 
             db: Annotated[AsyncSession, Depends(get_db)]) -> RegisterResponse:
    
    # check if email already exists
    existing_email = await get_user_by_email(db, body.email)
    if existing_email:
        raise HTTPException(detail="Username or email already registered", status_code=409)

    # check if username already exists
    existing_username = await get_user_by_username(db, body.username)
    if existing_username:
        raise HTTPException(detail="Username or email already registered", status_code=409)
    
    # hash the password
    hashed_password = await run_in_threadpool(hash_password, body.password)

    # create new user
    await save_user(db, body, hashed_password)

    return RegisterResponse(message="User registered successfully")