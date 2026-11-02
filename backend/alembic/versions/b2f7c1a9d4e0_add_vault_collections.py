"""add vault collections

Revision ID: b2f7c1a9d4e0
Revises: f1c2d3e4a5b6
Create Date: 2026-11-02 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2f7c1a9d4e0'
down_revision: Union[str, Sequence[str], None] = 'f1c2d3e4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the vault table and seed the SILVER product."""
    op.create_table(
        'vault_collections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('amount_paisa', sa.BigInteger(), nullable=False),
        sa.Column('grams', sa.Numeric(precision=14, scale=3), nullable=False),
        sa.Column('price_per_gram_paisa', sa.BigInteger(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.CheckConstraint(
            'amount_paisa > 0',
            name='ck_vault_collections_amount_positive',
        ),
        sa.CheckConstraint(
            'grams > 0',
            name='ck_vault_collections_grams_positive',
        ),
        sa.CheckConstraint(
            'price_per_gram_paisa > 0',
            name='ck_vault_collections_price_positive',
        ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'ix_vault_collections_user_id',
        'vault_collections',
        ['user_id'],
    )

    # The vault needs a product to sell. ON CONFLICT keeps this safe if the
    # product already exists.
    op.execute(
        sa.text(
            """
            INSERT INTO products (code, name, unit, description)
            VALUES ('SILVER', 'Silver', 'gram', 'Silver collected in the vault')
            ON CONFLICT (code) DO NOTHING
            """
        )
    )

    # Placeholder price (Rs 200 per gram) so the feature is usable in
    # development. Replace it with a real feed before going live.
    op.execute(
        sa.text(
            """
            INSERT INTO price_history (product_id, price, source)
            SELECT p.id, 20000, 'seed'
            FROM products p
            WHERE p.code = 'SILVER'
              AND NOT EXISTS (
                  SELECT 1 FROM price_history ph WHERE ph.product_id = p.id
              )
            """
        )
    )


def downgrade() -> None:
    """Drop the vault table."""
    op.drop_index(
        'ix_vault_collections_user_id',
        table_name='vault_collections',
    )
    op.drop_table('vault_collections')
