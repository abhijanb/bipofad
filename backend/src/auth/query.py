from models import User
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def suggested_username(username: str, db: AsyncSession) -> str:
    # Check if the username already exists in the database
    existing_user = await get_user_by_username(db, username)
    if not existing_user:
        return username  # The username is available

    # If the username exists, suggest a new one by appending a number
    suffix = 1
    while True:
        suggested_username = f"{username}{suffix}"
        existing_user = await get_user_by_username(db, suggested_username)
        if not existing_user:
            return suggested_username  # Found an available username
        suffix += 1


async def suggested_email(email: str, db: AsyncSession) -> str:
    local_part, _, domain = email.rpartition("@")
    if not local_part or not domain:
        return email

    # If the email exists, suggest a new one by appending a number to the local part
    suffix = 1
    while True:
        candidate = f"{local_part}{suffix}@{domain}"
        if not await get_user_by_email(db, candidate):
            return candidate  # Found an available email
        suffix += 1
