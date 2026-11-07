from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from config import settings
from models import User
from src.auth.schema import RegisterRequest
from src.wallet.mutation import record_wallet_transaction


async def save_user(
    db: AsyncSession,
    user_data: RegisterRequest,
    hashed_password: str,
) -> User:
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        balance_paisa=settings.demo_balance_paisa,
    )
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Username or email already registered",
        ) from None

    # Keep the demo grant in the ledger so the balance is never unexplained.
    if settings.demo_balance_paisa > 0:
        await record_wallet_transaction(
            db,
            user_id=user.id,
            type="demo_credit",
            amount_paisa=settings.demo_balance_paisa,
            balance_after_paisa=settings.demo_balance_paisa,
            description="Demo starting balance",
        )

    return user
