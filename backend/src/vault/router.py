from typing import Annotated

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy.ext.asyncio.session import AsyncSession

from database import get_db
from models import User
from src.auth.dependencies import get_current_superuser, get_current_user
from src.vault.mutation import collect_metal as collect_metal_for_user
from src.vault.mutation import record_price, sell_metal as sell_metal_for_user
from src.vault.query import get_price_history, get_vault_summary
from src.vault.schema import (
    CollectRequest,
    CollectResponse,
    PricePoint,
    ProductCode,
    SellRequest,
    SellResponse,
    SetPriceRequest,
    VaultSummary,
)

vault_router = APIRouter(prefix="/vault", tags=["vault"])


@vault_router.get("", response_model=VaultSummary, status_code=200)
async def get_vault(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    product: Annotated[ProductCode, Query()] = "SILVER",
) -> VaultSummary:
    """Return the signed-in user's vault for one metal.

    Metal balances are cached on `users` and kept in sync with
    `vault_collections`. The current rate comes from PriceHistory.
    """
    return await get_vault_summary(db, user.id, product)


@vault_router.post(
    "/collect",
    response_model=CollectResponse,
    status_code=201,
)
async def collect_metal(
    body: Annotated[CollectRequest, Body()],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CollectResponse:
    """Collect a metal for a rupee amount.

    Pricing, the atomic wallet debit, and the collection insert live in
    `src.vault.mutation`.
    """
    return await collect_metal_for_user(db, user, body)


@vault_router.post(
    "/sell",
    response_model=SellResponse,
    status_code=201,
)
async def sell_metal(
    body: Annotated[SellRequest, Body()],
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SellResponse:
    """Cash out metal into the wallet at the current price.

    A per-product minimum weight is enforced. Cash-outs credit the wallet for
    now; bank or cash payouts are a later payment/KYC step.
    """
    return await sell_metal_for_user(db, user, body)


@vault_router.get(
    "/prices",
    response_model=list[PricePoint],
    status_code=200,
)
async def list_prices(
    db: Annotated[AsyncSession, Depends(get_db)],
    product: Annotated[ProductCode, Query()] = "SILVER",
    limit: Annotated[int, Query(ge=1, le=365)] = 30,
) -> list[PricePoint]:
    """Recent prices for one metal, oldest first, for the history chart."""
    return await get_price_history(db, product, limit)


@vault_router.post(
    "/prices",
    response_model=PricePoint,
    status_code=201,
)
async def set_price(
    body: Annotated[SetPriceRequest, Body()],
    user: Annotated[User, Depends(get_current_superuser)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PricePoint:
    """Record an admin-entered price for a metal."""
    return await record_price(db, body)
