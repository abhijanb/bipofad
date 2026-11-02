"""add wallet balance to users

Revision ID: e3a8b5c2f9d1
Revises: c9d4e2f7a1b3
Create Date: 2026-11-02 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3a8b5c2f9d1'
down_revision: Union[str, Sequence[str], None] = 'c9d4e2f7a1b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the wallet balance and restore silver_grams from the ledger."""
    op.add_column(
        'users',
        sa.Column(
            'balance_paisa',
            sa.BigInteger(),
            server_default=sa.text('0'),
            nullable=False,
        ),
    )
    op.create_check_constraint(
        'ck_users_balance_paisa_non_negative',
        'users',
        'balance_paisa >= 0',
    )
    op.create_check_constraint(
        'ck_users_silver_grams_non_negative',
        'users',
        'silver_grams >= 0',
    )

    # The earlier demo wrote straight to silver_grams. Rebuild it from the
    # collection ledger so the cached balance is trustworthy again.
    op.execute(
        sa.text(
            """
            UPDATE users u
            SET silver_grams = COALESCE(
                (
                    SELECT SUM(v.grams)
                    FROM vault_collections v
                    WHERE v.user_id = u.id
                ),
                0
            )
            """
        )
    )


def downgrade() -> None:
    """Drop the wallet balance."""
    op.drop_constraint(
        'ck_users_silver_grams_non_negative',
        'users',
        type_='check',
    )
    op.drop_constraint(
        'ck_users_balance_paisa_non_negative',
        'users',
        type_='check',
    )
    op.drop_column('users', 'balance_paisa')
