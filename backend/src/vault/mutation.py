from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import User, VaultCollection
from src.vault.query import (
    collection_to_schema,
    get_latest_silver_price,
    get_silver_product,
    grams_for_amount,
)
from src.vault.schema import CollectSilverRequest, CollectSilverResponse


async def collect_silver(
    db: AsyncSession,
    user: User,
    data: CollectSilverRequest,
) -> CollectSilverResponse:
    """Buy silver with wallet balance at the current price."""
    product = await get_silver_product(db)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Silver is not available right now",
        )

    price_per_gram_paisa = await get_latest_silver_price(db)
    if price_per_gram_paisa is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Silver price is not available right now",
        )

    grams = grams_for_amount(data.amount_paisa, price_per_gram_paisa)
    if grams <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount is too small for the current silver price",
        )

    # Debit the wallet and credit silver in one atomic statement. If the
    # balance is too low no row is returned and nothing is written.
    balances = await db.execute(
        update(User)
        .where(User.id == user.id, User.balance_paisa >= data.amount_paisa)
        .values(
            balance_paisa=User.balance_paisa - data.amount_paisa,
            silver_grams=User.silver_grams + grams,
        )
        .returning(User.balance_paisa, User.silver_grams)
    )
    row = balances.one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient balance",
        )

    collection = VaultCollection(
        user_id=user.id,
        product_id=product.id,
        amount_paisa=data.amount_paisa,
        grams=grams,
        price_per_gram_paisa=price_per_gram_paisa,
    )
    db.add(collection)
    await db.flush()
    await db.refresh(collection)

    return CollectSilverResponse(
        message="Silver collected",
        collection=collection_to_schema(collection),
        balance_grams=float(row.silver_grams),
        balance_paisa=int(row.balance_paisa),
    )
