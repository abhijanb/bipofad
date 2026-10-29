from fastapi import HTTPException
from src.auth.schema import RegisterRequest
from models import User
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
async def save_user(db: AsyncSession, user_data: RegisterRequest, hashed_password: str) -> User:
    user = User(username=user_data.username, email=user_data.email, hashed_password=hashed_password)
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already registered") from None
    return user
