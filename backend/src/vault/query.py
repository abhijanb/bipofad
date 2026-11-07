from decimal import ROUND_DOWN, ROUND_HALF_UP, Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import PriceHistory, Product, User, VaultCollection, VaultSale
from src.vault.schema import PricePoint, ProductCode
from src.vault.schema import VaultCollection as VaultCollectionOut
from src.vault.schema import VaultSale as VaultSaleOut
from src.vault.schema import VaultSummary

GRAMS_QUANTUM = Decimal("0.001")


def product_label(product: ProductCode) -> str:
    return "Gold" if product == "GOLD" else "Silver"


def grams_column_for(product: ProductCode):
    return User.gold_grams if product == "GOLD" else User.silver_grams


async def get_product(db: AsyncSession, code: ProductCode) -> Product | None:
    result = await db.execute(select(Product).where(Product.code == code))
    return result.scalars().first()


async def get_latest_price(
    db: AsyncSession,
    product: ProductCode,
) -> PriceHistory | None:
    """Latest price row for a product, or None if none is recorded."""
    result = await db.execute(
        select(PriceHistory)
        .join(Product, Product.id == PriceHistory.product_id)
        .where(Product.code == product)
        .order_by(PriceHistory.created_at.desc(), PriceHistory.id.desc())
        .limit(1)
    )
    return result.scalars().first()


async def get_price_history(
    db: AsyncSession,
    product: ProductCode,
    limit: int,
) -> list[PricePoint]:
    result = await db.execute(
        select(PriceHistory)
        .join(Product, Product.id == PriceHistory.product_id)
        .where(Product.code == product)
        .order_by(PriceHistory.created_at.desc(), PriceHistory.id.desc())
        .limit(limit)
    )
    rows = list(result.scalars().all())
    rows.reverse()
    return [price_to_schema(row) for row in rows]


def price_to_schema(row: PriceHistory) -> PricePoint:
    return PricePoint(
        price_per_gram_paisa=row.price,
        source=row.source,
        recorded_at=row.created_at,
    )


def grams_for_amount(amount_paisa: int, price_per_gram_paisa: int) -> Decimal:
    """Convert paisa to grams, rounded down to the milligram."""
    if price_per_gram_paisa <= 0:
        raise ValueError("price_per_gram_paisa must be positive")
    return (Decimal(amount_paisa) / Decimal(price_per_gram_paisa)).quantize(
        GRAMS_QUANTUM,
        rounding=ROUND_DOWN,
    )


def amount_for_grams(
    grams: Decimal,
    price_per_gram_paisa: int,
) -> int:
    """Convert grams to paisa, rounded down so the vault never overpays."""
    if price_per_gram_paisa <= 0:
        raise ValueError("price_per_gram_paisa must be positive")
    return int(
        (grams * Decimal(price_per_gram_paisa)).to_integral_value(
            rounding=ROUND_DOWN
        )
    )


async def get_vault_balances(
    db: AsyncSession,
    user_id: int,
    product: ProductCode,
) -> tuple[Decimal, int]:
    """Return (cached metal grams, wallet paisa) for a user."""
    result = await db.execute(
        select(grams_column_for(product), User.balance_paisa).where(
            User.id == user_id
        )
    )
    row = result.one_or_none()
    if row is None:
        return Decimal("0"), 0
    return Decimal(row[0]), int(row[1])


async def get_vault_collections(
    db: AsyncSession,
    user_id: int,
    product_id: int,
) -> list[VaultCollection]:
    result = await db.execute(
        select(VaultCollection)
        .where(
            VaultCollection.user_id == user_id,
            VaultCollection.product_id == product_id,
        )
        .order_by(VaultCollection.created_at.desc(), VaultCollection.id.desc())
    )
    return list(result.scalars().all())


async def get_vault_sales(
    db: AsyncSession,
    user_id: int,
    product_id: int,
) -> list[VaultSale]:
    result = await db.execute(
        select(VaultSale)
        .where(
            VaultSale.user_id == user_id,
            VaultSale.product_id == product_id,
        )
        .order_by(VaultSale.created_at.desc(), VaultSale.id.desc())
    )
    return list(result.scalars().all())


def sale_to_schema(row: VaultSale) -> VaultSaleOut:
    return VaultSaleOut(
        id=row.id,
        grams=row.grams,
        amount_paisa=row.amount_paisa,
        price_per_gram_paisa=row.price_per_gram_paisa,
        sold_at=row.created_at,
    )


def collection_to_schema(row: VaultCollection) -> VaultCollectionOut:
    return VaultCollectionOut(
        id=row.id,
        amount_paisa=row.amount_paisa,
        grams=row.grams,
        price_per_gram_paisa=row.price_per_gram_paisa,
        collected_at=row.created_at,
    )


async def get_vault_summary(
    db: AsyncSession,
    user_id: int,
    product: ProductCode,
) -> VaultSummary:
    product_row = await get_product(db, product)
    if product_row is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{product_label(product)} is not available right now",
        )

    price_row = await get_latest_price(db, product)
    price = price_row.price if price_row and price_row.price > 0 else None
    price_updated_at = price_row.created_at if price is not None else None

    balance_grams, balance_paisa = await get_vault_balances(
        db, user_id, product
    )
    collections = await get_vault_collections(db, user_id, product_row.id)
    sales = await get_vault_sales(db, user_id, product_row.id)

    value_paisa = 0
    if price is not None:
        value_paisa = int(
            (balance_grams * price).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
        )

    return VaultSummary(
        product=product,
        balance_paisa=balance_paisa,
        balance_grams=balance_grams,
        price_per_gram_paisa=price,
        price_updated_at=price_updated_at,
        value_paisa=value_paisa,
        min_cashout_grams=product_row.min_cashout_grams,
        collections=[collection_to_schema(row) for row in collections],
        sales=[sale_to_schema(row) for row in sales],
    )
