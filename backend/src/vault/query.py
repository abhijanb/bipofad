from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import PriceHistory, Product, User, VaultCollection
from src.vault.schema import VaultCollection as VaultCollectionOut
from src.vault.schema import VaultSummary

GRAMS_QUANTUM = Decimal("0.001")


async def get_silver_product(db: AsyncSession) -> Product | None:
    result = await db.execute(select(Product).where(Product.code == "SILVER"))
    return result.scalars().first()


async def get_latest_silver_price(db: AsyncSession) -> int | None:
    """Latest silver price in paisa per gram, or None if none is recorded."""
    result = await db.execute(
        select(PriceHistory.price)
        .join(Product, Product.id == PriceHistory.product_id)
        .where(Product.code == "SILVER")
        .order_by(PriceHistory.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


def grams_for_amount(amount_paisa: int, price_per_gram_paisa: int) -> Decimal:
    """Convert paisa to grams, rounded down to the milligram."""
    if price_per_gram_paisa <= 0:
        raise ValueError("price_per_gram_paisa must be positive")
    return (Decimal(amount_paisa) / Decimal(price_per_gram_paisa)).quantize(
        GRAMS_QUANTUM,
        rounding=ROUND_DOWN,
    )


async def get_vault_balances(
    db: AsyncSession,
    user_id: int,
) -> tuple[Decimal, int]:
    """Return (cached silver grams, wallet paisa) for a user."""
    result = await db.execute(
        select(User.silver_grams, User.balance_paisa).where(User.id == user_id)
    )
    row = result.one_or_none()
    if row is None:
        return Decimal("0"), 0
    return Decimal(row.silver_grams), int(row.balance_paisa)


async def get_vault_collections(
    db: AsyncSession,
    user_id: int,
) -> list[VaultCollection]:
    result = await db.execute(
        select(VaultCollection)
        .where(VaultCollection.user_id == user_id)
        .order_by(VaultCollection.created_at.desc(), VaultCollection.id.desc())
    )
    return list(result.scalars().all())


def collection_to_schema(row: VaultCollection) -> VaultCollectionOut:
    return VaultCollectionOut(
        id=row.id,
        amount_paisa=row.amount_paisa,
        grams=float(row.grams),
        price_per_gram_paisa=row.price_per_gram_paisa,
        collected_at=row.created_at,
    )


async def get_vault_summary(db: AsyncSession, user_id: int) -> VaultSummary:
    price = await get_latest_silver_price(db)
    balance_grams, balance_paisa = await get_vault_balances(db, user_id)
    collections = await get_vault_collections(db, user_id)

    value_paisa = 0
    if price is not None:
        value_paisa = int(
            (balance_grams * price).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        )

    return VaultSummary(
        balance_paisa=balance_paisa,
        balance_grams=float(balance_grams),
        price_per_gram_paisa=price,
        value_paisa=value_paisa,
        collections=[collection_to_schema(row) for row in collections],
    )
