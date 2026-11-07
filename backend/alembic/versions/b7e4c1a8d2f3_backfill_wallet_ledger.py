"""backfill wallet ledger for existing users

Revision ID: b7e4c1a8d2f3
Revises: 4d7e2a9b6c1f
Create Date: 2026-11-04 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7e4c1a8d2f3'
down_revision: Union[str, Sequence[str], None] = '4d7e2a9b6c1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rebuild ledger history from current balances and collections.

    The opening credit is current balance + everything already spent on
    collections. Replaying the purchases then lands exactly on the current
    balance, so `SUM(amount_paisa) = users.balance_paisa`.

    Users that already have ledger rows are left alone: their entries were
    written after the ledger went live and need no backfill.
    """
    op.execute(
        sa.text(
            """
            INSERT INTO wallet_transactions (
                user_id,
                type,
                amount_paisa,
                balance_after_paisa,
                description,
                idempotency_key,
                created_at
            )
            SELECT
                u.id,
                'opening_balance',
                u.balance_paisa + COALESCE(c.total_paisa, 0),
                u.balance_paisa + COALESCE(c.total_paisa, 0),
                'Backfilled opening balance',
                'backfill:opening:' || u.id,
                COALESCE(u.created_at, now())
            FROM users u
            LEFT JOIN (
                SELECT user_id, SUM(amount_paisa) AS total_paisa
                FROM vault_collections
                GROUP BY user_id
            ) c ON c.user_id = u.id
            WHERE NOT EXISTS (
                SELECT 1
                FROM wallet_transactions t
                WHERE t.user_id = u.id
            )
              AND u.balance_paisa + COALESCE(c.total_paisa, 0) <> 0
            ON CONFLICT (user_id, idempotency_key) DO NOTHING
            """
        )
    )

    op.execute(
        sa.text(
            """
            INSERT INTO wallet_transactions (
                user_id,
                type,
                amount_paisa,
                balance_after_paisa,
                reference_type,
                reference_id,
                description,
                idempotency_key,
                created_at
            )
            SELECT
                v.user_id,
                'silver_purchase',
                -v.amount_paisa,
                opening.amount_paisa + SUM(-v.amount_paisa) OVER (
                    PARTITION BY v.user_id
                    ORDER BY v.created_at, v.id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ),
                'vault_collection',
                v.id,
                'Backfilled silver purchase',
                'backfill:vault_collection:' || v.id,
                v.created_at
            FROM vault_collections v
            JOIN wallet_transactions opening
              ON opening.user_id = v.user_id
             AND opening.idempotency_key = 'backfill:opening:' || v.user_id
            WHERE NOT EXISTS (
                SELECT 1
                FROM wallet_transactions t
                WHERE t.user_id = v.user_id
                  AND t.idempotency_key = 'backfill:vault_collection:' || v.id
            )
            ON CONFLICT (user_id, idempotency_key) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    """Remove only rows created by this backfill."""
    op.execute(
        sa.text(
            """
            DELETE FROM wallet_transactions
            WHERE idempotency_key LIKE 'backfill:%'
            """
        )
    )
