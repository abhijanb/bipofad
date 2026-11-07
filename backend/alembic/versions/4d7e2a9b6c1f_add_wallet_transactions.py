"""add wallet transactions ledger

Revision ID: 4d7e2a9b6c1f
Revises: e3a8b5c2f9d1
Create Date: 2026-11-04 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d7e2a9b6c1f'
down_revision: Union[str, Sequence[str], None] = 'e3a8b5c2f9d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the append-only wallet ledger."""
    op.create_table(
        'wallet_transactions',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=32), nullable=False),
        sa.Column('amount_paisa', sa.BigInteger(), nullable=False),
        sa.Column('balance_after_paisa', sa.BigInteger(), nullable=False),
        sa.Column('reference_type', sa.String(length=32), nullable=True),
        sa.Column('reference_id', sa.BigInteger(), nullable=True),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('idempotency_key', sa.String(length=128), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.CheckConstraint(
            'amount_paisa <> 0',
            name='ck_wallet_transactions_amount_non_zero',
        ),
        sa.CheckConstraint(
            'balance_after_paisa >= 0',
            name='ck_wallet_transactions_balance_after_non_negative',
        ),
        sa.CheckConstraint(
            "type IN ("
            "'demo_credit', 'admin_credit', 'deposit', "
            "'silver_purchase', 'silver_sale', 'refund', "
            "'opening_balance', 'reversal'"
            ")",
            name='ck_wallet_transactions_type',
        ),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            ondelete='RESTRICT',
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'user_id',
            'idempotency_key',
            name='uix_wallet_transactions_user_idempotency',
        ),
    )
    op.create_index(
        'ix_wallet_transactions_user_created',
        'wallet_transactions',
        ['user_id', 'created_at'],
    )
    op.create_index(
        'ix_wallet_transactions_reference',
        'wallet_transactions',
        ['reference_type', 'reference_id'],
    )


def downgrade() -> None:
    """Drop the wallet ledger."""
    op.drop_index(
        'ix_wallet_transactions_reference',
        table_name='wallet_transactions',
    )
    op.drop_index(
        'ix_wallet_transactions_user_created',
        table_name='wallet_transactions',
    )
    op.drop_table('wallet_transactions')
