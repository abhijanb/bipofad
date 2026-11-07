from typing import Annotated

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.ext.asyncio.session import AsyncSession

from database import get_db
from models import User
from src.auth.dependencies import get_current_superuser, get_current_user
from src.wallet.mutation import credit_wallet
from src.wallet.query import list_wallet_transactions
from src.wallet.schema import (
    AdminCreditRequest,
    AdminCreditResponse,
    WalletTransactionOut,
)

wallet_router = APIRouter(prefix="/wallet", tags=["wallet"])


@wallet_router.get(
    "/transactions",
    response_model=list[WalletTransactionOut],
    status_code=200,
)
async def list_transactions(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    before_id: Annotated[int | None, Query(ge=1)] = None,
) -> list[WalletTransactionOut]:
    """Return the signed-in user's wallet ledger, newest first."""
    return await list_wallet_transactions(db, user.id, limit, before_id)


@wallet_router.post(
    "/credit",
    response_model=AdminCreditResponse,
    status_code=201,
)
async def credit_wallet_endpoint(
    body: Annotated[AdminCreditRequest, Body()],
    admin: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AdminCreditResponse:
    """Credit a wallet. Superuser-only, for testing and support."""
    return await credit_wallet(db, admin, body)
