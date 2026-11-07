"""Wallet ledger writes.

`users.balance_paisa` is the cached balance. Every change to it must also add
one `wallet_transactions` row in the same transaction, so the balance can
always be explained (and reconciled) from the ledger.
"""

from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from models import User, WalletTransaction
from src.auth.query import get_user_by_email
from src.wallet.query import (
    get_wallet_transaction_by_key,
    transaction_to_schema,
)
from src.wallet.schema import AdminCreditRequest, AdminCreditResponse


async def record_wallet_transaction(
    db: AsyncSession,
    *,
    user_id: int,
    type: str,
    amount_paisa: int,
    balance_after_paisa: int,
    reference_type: str | None = None,
    reference_id: int | None = None,
    description: str | None = None,
    idempotency_key: str | None = None,
) -> WalletTransaction:
    """Insert one ledger row and flush it inside the caller's transaction."""
    transaction = WalletTransaction(
        user_id=user_id,
        type=type,
        amount_paisa=amount_paisa,
        balance_after_paisa=balance_after_paisa,
        reference_type=reference_type,
        reference_id=reference_id,
        description=description,
        idempotency_key=idempotency_key,
    )
    db.add(transaction)
    await db.flush()
    return transaction


def _existing_credit_response(
    existing: WalletTransaction,
    data: AdminCreditRequest,
) -> AdminCreditResponse:
    if existing.type != "admin_credit" or existing.amount_paisa != data.amount_paisa:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Idempotency key was already used for a different credit",
        )

    return AdminCreditResponse(
        message="Credit already applied",
        transaction=transaction_to_schema(existing),
        balance_paisa=existing.balance_after_paisa,
    )


async def credit_wallet(
    db: AsyncSession,
    admin: User,
    data: AdminCreditRequest,
) -> AdminCreditResponse:
    """Credit a user's wallet from the admin UI.

    The balance update and ledger insert share the request transaction. A
    retried request with the same idempotency key returns the original row
    instead of crediting twice.
    """
    target = await get_user_by_email(db, str(data.user_email).lower())
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    target_user_id = target.id

    existing = await get_wallet_transaction_by_key(
        db, target_user_id, data.idempotency_key
    )
    if existing is not None:
        return _existing_credit_response(existing, data)

    balances = await db.execute(
        update(User)
        .where(User.id == target_user_id)
        .values(balance_paisa=User.balance_paisa + data.amount_paisa)
        .returning(User.balance_paisa)
    )
    new_balance = int(balances.scalar_one())

    try:
        transaction = await record_wallet_transaction(
            db,
            user_id=target_user_id,
            type="admin_credit",
            amount_paisa=data.amount_paisa,
            balance_after_paisa=new_balance,
            reference_type="admin_user",
            reference_id=admin.id,
            description=data.description or f"Admin credit by {admin.username}",
            idempotency_key=data.idempotency_key,
        )
    except IntegrityError:
        # A concurrent request used the same key. That transaction's balance
        # update has already been rolled back with ours.
        await db.rollback()
        existing = await get_wallet_transaction_by_key(
            db, target_user_id, data.idempotency_key
        )
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Could not apply the credit",
            ) from None
        return _existing_credit_response(existing, data)

    return AdminCreditResponse(
        message="Wallet credited",
        transaction=transaction_to_schema(transaction),
        balance_paisa=new_balance,
    )
