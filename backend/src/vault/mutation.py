from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import PriceHistory, User, VaultCollection, VaultSale, WalletTransaction
from src.vault.query import (
    amount_for_grams,
    collection_to_schema,
    get_latest_price,
    get_product,
    grams_column_for,
    grams_for_amount,
    price_to_schema,
    product_label,
    sale_to_schema,
)
from src.vault.schema import (
    CollectRequest,
    CollectResponse,
    PricePoint,
    SellRequest,
    SellResponse,
    SetPriceRequest,
)
from src.wallet.mutation import record_wallet_transaction
from src.wallet.query import get_wallet_transaction_by_key


def _purchase_type(product: str) -> str:
    return "gold_purchase" if product == "GOLD" else "silver_purchase"


def _sale_type(product: str) -> str:
    return "gold_sale" if product == "GOLD" else "silver_sale"


async def _replay_purchase(
    db: AsyncSession,
    user_id: int,
    existing: WalletTransaction,
    data: CollectRequest,
) -> CollectResponse:
    """Return the original purchase for a retried request."""
    if existing.type != _purchase_type(data.product) or existing.amount_paisa >= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key was already used for a different request",
        )

    if (
        existing.reference_type != "vault_collection"
        or existing.reference_id is None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key has no matching collection",
        )

    collection = await db.get(VaultCollection, existing.reference_id)
    product = await get_product(db, data.product)
    if (
        collection is None
        or product is None
        or collection.user_id != user_id
        or collection.product_id != product.id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key has no matching collection",
        )

    # The purchase may have charged less than requested because grams are
    # whole units. Validate the request against the price stored on the
    # original collection.
    expected_grams = grams_for_amount(
        data.amount_paisa, collection.price_per_gram_paisa
    )
    expected_amount = expected_grams * collection.price_per_gram_paisa
    if (
        expected_grams <= 0
        or collection.grams != expected_grams
        or collection.amount_paisa != expected_amount
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key was already used for a different request",
        )

    balances = await db.execute(
        select(grams_column_for(data.product), User.balance_paisa).where(
            User.id == user_id
        )
    )
    row = balances.one()

    return CollectResponse(
        message=f"{product_label(data.product)} already collected",
        collection=collection_to_schema(collection),
        balance_grams=int(row[0]),
        balance_paisa=int(row[1]),
    )


async def _replay_sale(
    db: AsyncSession,
    user_id: int,
    existing: WalletTransaction,
    data: SellRequest,
) -> SellResponse:
    """Return the original cash-out for a retried request."""
    if (
        existing.type != _sale_type(data.product)
        or existing.amount_paisa <= 0
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key was already used for a different request",
        )

    if existing.reference_type != "vault_sale" or existing.reference_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key has no matching sale",
        )

    sale = await db.get(VaultSale, existing.reference_id)
    product = await get_product(db, data.product)
    if (
        sale is None
        or product is None
        or sale.user_id != user_id
        or sale.product_id != product.id
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key has no matching sale",
        )

    if sale.grams != data.grams:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key was already used for a different request",
        )

    balances = await db.execute(
        select(grams_column_for(data.product), User.balance_paisa).where(
            User.id == user_id
        )
    )
    row = balances.one()

    return SellResponse(
        message=f"{product_label(data.product)} already cashed out",
        sale=sale_to_schema(sale),
        balance_grams=int(row[0]),
        balance_paisa=int(row[1]),
    )


async def collect_metal(
    db: AsyncSession,
    user: User,
    data: CollectRequest,
) -> CollectResponse:
    """Buy a metal with wallet balance at the current price."""
    user_id = user.id
    existing = await get_wallet_transaction_by_key(
        db, user_id, data.idempotency_key
    )
    if existing is not None:
        return await _replay_purchase(db, user_id, existing, data)

    label = product_label(data.product)
    product = await get_product(db, data.product)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{label} is not available right now",
        )

    price_row = await get_latest_price(db, data.product)
    if price_row is None or price_row.price <= 0:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{label} price is not available right now",
        )
    price_per_gram_paisa = price_row.price

    grams = grams_for_amount(data.amount_paisa, price_per_gram_paisa)
    if grams <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Amount is too small for the current {label.lower()} price. "
                f"At least {price_per_gram_paisa} paisa is needed for 1 g."
            ),
        )

    # Whole grams rarely divide the requested amount exactly. Charge only what
    # the grams actually cost and leave the remainder in the wallet.
    amount_paisa = grams * price_per_gram_paisa

    # Debit the wallet and credit the metal in one atomic statement. If the
    # balance is too low no row is returned and nothing is written.
    grams_column = grams_column_for(data.product)
    balances = await db.execute(
        update(User)
        .where(User.id == user_id, User.balance_paisa >= amount_paisa)
        .values(
            balance_paisa=User.balance_paisa - amount_paisa,
            **{grams_column.key: grams_column + grams},
        )
        .returning(User.balance_paisa, grams_column)
    )
    row = balances.one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient balance",
        )

    new_balance = int(row[0])
    new_grams = int(row[1])

    collection = VaultCollection(
        user_id=user_id,
        product_id=product.id,
        amount_paisa=amount_paisa,
        grams=grams,
        price_per_gram_paisa=price_per_gram_paisa,
    )
    db.add(collection)
    await db.flush()
    await db.refresh(collection)

    try:
        await record_wallet_transaction(
            db,
            user_id=user_id,
            type=_purchase_type(data.product),
            amount_paisa=-amount_paisa,
            balance_after_paisa=new_balance,
            reference_type="vault_collection",
            reference_id=collection.id,
            description=(
                f"{label} purchase: {grams} g at "
                f"{price_per_gram_paisa} paisa/g"
            ),
            idempotency_key=data.idempotency_key,
        )
    except IntegrityError:
        # A concurrent request with the same key won. Our debit and
        # collection insert are rolled back with this failure.
        await db.rollback()
        existing = await get_wallet_transaction_by_key(
            db, user_id, data.idempotency_key
        )
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Could not record the {label.lower()} purchase",
            ) from None
        return await _replay_purchase(db, user_id, existing, data)

    return CollectResponse(
        message=f"{label} collected",
        collection=collection_to_schema(collection),
        balance_grams=new_grams,
        balance_paisa=new_balance,
    )


async def sell_metal(
    db: AsyncSession,
    user: User,
    data: SellRequest,
) -> SellResponse:
    """Cash out metal into the wallet at the current price.

    The vault does not pay out to a bank account yet: the sale credits the
    user's wallet so the money can be used for another purchase or withdrawn
    later. A per-product minimum weight prevents dust-sized cash-outs.
    """
    user_id = user.id
    existing = await get_wallet_transaction_by_key(
        db, user_id, data.idempotency_key
    )
    if existing is not None:
        return await _replay_sale(db, user_id, existing, data)

    label = product_label(data.product)
    product = await get_product(db, data.product)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{label} is not available right now",
        )

    if data.grams < product.min_cashout_grams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Minimum cash-out is {product.min_cashout_grams} g "
                f"of {label.lower()}"
            ),
        )

    price_row = await get_latest_price(db, data.product)
    if price_row is None or price_row.price <= 0:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{label} price is not available right now",
        )
    price_per_gram_paisa = price_row.price

    amount_paisa = amount_for_grams(data.grams, price_per_gram_paisa)
    if amount_paisa <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Amount is too small for the current {label.lower()} price",
        )

    # Debit the metal and credit the wallet in one atomic statement. If the
    # holding is too low no row is returned and nothing is written.
    grams_column = grams_column_for(data.product)
    balances = await db.execute(
        update(User)
        .where(User.id == user_id, grams_column >= data.grams)
        .values(
            **{grams_column.key: grams_column - data.grams},
            balance_paisa=User.balance_paisa + amount_paisa,
        )
        .returning(grams_column, User.balance_paisa)
    )
    row = balances.one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough {label.lower()} to cash out",
        )

    new_grams = int(row[0])
    new_balance = int(row[1])

    sale = VaultSale(
        user_id=user_id,
        product_id=product.id,
        grams=data.grams,
        amount_paisa=amount_paisa,
        price_per_gram_paisa=price_per_gram_paisa,
    )
    db.add(sale)
    await db.flush()
    await db.refresh(sale)

    try:
        await record_wallet_transaction(
            db,
            user_id=user_id,
            type=_sale_type(data.product),
            amount_paisa=amount_paisa,
            balance_after_paisa=new_balance,
            reference_type="vault_sale",
            reference_id=sale.id,
            description=(
                f"{label} cash-out: {data.grams} g at "
                f"{price_per_gram_paisa} paisa/g"
            ),
            idempotency_key=data.idempotency_key,
        )
    except IntegrityError:
        # A concurrent request with the same key won. Our metal debit and
        # sale insert are rolled back with this failure.
        await db.rollback()
        existing = await get_wallet_transaction_by_key(
            db, user_id, data.idempotency_key
        )
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Could not record the {label.lower()} cash-out",
            ) from None
        return await _replay_sale(db, user_id, existing, data)

    return SellResponse(
        message=f"{label} cashed out",
        sale=sale_to_schema(sale),
        balance_grams=new_grams,
        balance_paisa=new_balance,
    )


async def record_price(
    db: AsyncSession,
    data: SetPriceRequest,
) -> PricePoint:
    """Insert an admin-entered price for a metal."""
    product = await get_product(db, data.product)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{product_label(data.product)} is not available right now",
        )

    price = PriceHistory(
        product_id=product.id,
        price=data.price_per_gram_paisa,
        source=data.source or "admin",
    )
    db.add(price)
    await db.flush()
    await db.refresh(price)
    return price_to_schema(price)
