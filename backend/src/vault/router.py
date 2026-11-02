from typing import Annotated

from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio.session import AsyncSession

from database import get_db
from models import User
from src.auth.dependencies import get_current_user
from src.vault.mutation import collect_silver as collect_silver_for_user
from src.vault.query import get_vault_summary
from src.vault.schema import (
    CollectSilverRequest,
    CollectSilverResponse,
    VaultSummary,
)

vault_router = APIRouter(prefix="/vault", tags=["vault"])


@vault_router.get("", response_model=VaultSummary, status_code=200)
async def get_vault(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VaultSummary:
    """Return the signed-in user's silver vault.

    There is no vault table yet, so every user currently sees an empty balance.
    The silver price is read from PriceHistory.
    """
    return await get_vault_summary(db, user.id)


@vault_router.post(
    "/collect",
    response_model=CollectSilverResponse,
    status_code=201,
)
async def collect_silver(
    body: Annotated[CollectSilverRequest, Body()],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CollectSilverResponse:
    """Collect silver for a rupee amount.

    Pricing and validation live in `src.vault.mutation`; persistence is still
    pending a `vault_collections` table.
    """
    return await collect_silver_for_user(db, user, body)
