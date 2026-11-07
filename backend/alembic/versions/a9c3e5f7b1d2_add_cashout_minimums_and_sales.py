"""add cashout minimums and vault sales

Revision ID: a9c3e5f7b1d2
Revises: f4a1c8d2e6b7
Create Date: 2026-11-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a9c3e5f7b1d2'
down_revision: Union[str, Sequence[str], None] = 'f4a1c8d2e6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add per-metal cash-out minimums and a sell history table."""
    op.add_column(
        'products',
        sa.Column(
            'min_cashout_grams',
            sa.Numeric(precision=14, scale=3),
            server_default=sa.text('0'),
            nullable=False,
        ),
    )
    op.create_check_constraint(
        'ck_products_min_cashout_non_negative',
        'products',
        'min_cashout_grams >= 0',
    )

    # Development defaults. These are deliberately small enough to demo but
    # large enough to avoid dust-sized cash-outs.
    op.execute(
        sa.text(
            "UPDATE products SET min_cashout_grams = 1.000 WHERE code = 'SILVER'"
        )
    )
    op.execute(
        sa.text(
            "UPDATE products SET min_cashout_grams = 0.100 WHERE code = 'GOLD'"
        )
    )

    op.create_table(
        'vault_sales',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('grams', sa.Numeric(precision=14, scale=3), nullable=False),
        sa.Column('amount_paisa', sa.BigInteger(), nullable=False),
        sa.Column('price_per_gram_paisa', sa.BigInteger(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.CheckConstraint(
            'grams > 0',
            name='ck_vault_sales_grams_positive',
        ),
        sa.CheckConstraint(
            'amount_paisa > 0',
            name='ck_vault_sales_amount_positive',
        ),
        sa.CheckConstraint(
            'price_per_gram_paisa > 0',
            name='ck_vault_sales_price_positive',
        ),
        sa.ForeignKeyConstraint(
            ['product_id'],
            ['products.id'],
        ),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'ix_vault_sales_user_id',
        'vault_sales',
        ['user_id'],
    )


def downgrade() -> None:
    """Remove sell history and cash-out minimums."""
    op.drop_index('ix_vault_sales_user_id', table_name='vault_sales')
    op.drop_table('vault_sales')
    op.drop_constraint(
        'ck_products_min_cashout_non_negative',
        'products',
        type_='check',
    )
    op.drop_column('products', 'min_cashout_grams')
