from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import WalletTransaction
from src.wallet.schema import WalletTransactionOut


def transaction_to_schema(row: WalletTransaction) -> WalletTransactionOut:
    return WalletTransactionOut(
        id=row.id,
        type=row.type,
        amount_paisa=row.amount_paisa,
        balance_after_paisa=row.balance_after_paisa,
        reference_type=row.reference_type,
        reference_id=row.reference_id,
        description=row.description,
        created_at=row.created_at,
    )


async def get_wallet_transaction_by_key(
    db: AsyncSession,
    user_id: int,
    idempotency_key: str,
) -> WalletTransaction | None:
    """Find the ledger row for a retried request, if it already ran."""
    result = await db.execute(
        select(WalletTransaction).where(
            WalletTransaction.user_id == user_id,
            WalletTransaction.idempotency_key == idempotency_key,
        )
    )
    return result.scalars().first()


async def list_wallet_transactions(
    db: AsyncSession,
    user_id: int,
    limit: int,
    before_id: int | None = None,
) -> list[WalletTransactionOut]:
    """Return one user's ledger rows, newest first."""
    stmt = select(WalletTransaction).where(WalletTransaction.user_id == user_id)
    if before_id is not None:
        stmt = stmt.where(WalletTransaction.id < before_id)
    stmt = stmt.order_by(WalletTransaction.id.desc()).limit(limit)

    rows = (await db.execute(stmt)).scalars().all()
    return [transaction_to_schema(row) for row in rows]
