"""add gold support

Revision ID: f4a1c8d2e6b7
Revises: b7e4c1a8d2f3
Create Date: 2026-11-05 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4a1c8d2e6b7'
down_revision: Union[str, Sequence[str], None] = 'b7e4c1a8d2f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add a separate gold balance, seed GOLD, and allow gold ledger types."""
    op.add_column(
        'users',
        sa.Column(
            'gold_grams',
            sa.Numeric(precision=14, scale=3),
            server_default=sa.text('0'),
            nullable=False,
        ),
    )
    op.create_check_constraint(
        'ck_users_gold_grams_non_negative',
        'users',
        'gold_grams >= 0',
    )

    op.drop_constraint(
        'ck_wallet_transactions_type',
        'wallet_transactions',
        type_='check',
    )
    op.create_check_constraint(
        'ck_wallet_transactions_type',
        'wallet_transactions',
        "type IN ("
        "'demo_credit', 'admin_credit', 'deposit', "
        "'silver_purchase', 'silver_sale', "
        "'gold_purchase', 'gold_sale', 'refund', "
        "'opening_balance', 'reversal'"
        ")",
    )

    # Seed the second tradeable product. The price is a development
    # placeholder; an admin can update it from the vault page.
    op.execute(
        sa.text(
            """
            INSERT INTO products (code, name, unit, description)
            VALUES ('GOLD', 'Gold', 'gram', 'Gold collected in the vault')
            ON CONFLICT (code) DO NOTHING
            """
        )
    )
    op.execute(
        sa.text(
            """
            INSERT INTO price_history (product_id, price, source)
            SELECT p.id, 1200000, 'seed'
            FROM products p
            WHERE p.code = 'GOLD'
              AND NOT EXISTS (
                  SELECT 1 FROM price_history ph WHERE ph.product_id = p.id
              )
            """
        )
    )

    # Existing installations have no gold collections, but keep the cached
    # balance consistent if this migration is ever applied to such data.
    op.execute(
        sa.text(
            """
            UPDATE users u
            SET gold_grams = COALESCE(
                (
                    SELECT SUM(v.grams)
                    FROM vault_collections v
                    JOIN products p ON p.id = v.product_id
                    WHERE v.user_id = u.id AND p.code = 'GOLD'
                ),
                0
            )
            """
        )
    )


def downgrade() -> None:
    """Remove gold data and restore the silver-only schema.

    Gold transactions and collections are deleted because the old schema has
    no place to store them. This is destructive; run it only in development.
    """
    op.execute(
        sa.text(
            """
            DELETE FROM wallet_transactions
            WHERE type IN ('gold_purchase', 'gold_sale')
            """
        )
    )
    op.execute(
        sa.text(
            """
            DELETE FROM vault_collections
            WHERE product_id IN (SELECT id FROM products WHERE code = 'GOLD')
            """
        )
    )
    op.execute(
        sa.text(
            """
            DELETE FROM price_history
            WHERE product_id IN (SELECT id FROM products WHERE code = 'GOLD')
            """
        )
    )
    op.execute(sa.text("DELETE FROM products WHERE code = 'GOLD'"))

    op.drop_constraint(
        'ck_wallet_transactions_type',
        'wallet_transactions',
        type_='check',
    )
    op.create_check_constraint(
        'ck_wallet_transactions_type',
        'wallet_transactions',
        "type IN ("
        "'demo_credit', 'admin_credit', 'deposit', "
        "'silver_purchase', 'silver_sale', 'refund', "
        "'opening_balance', 'reversal'"
        ")",
    )

    op.drop_constraint('ck_users_gold_grams_non_negative', 'users', type_='check')
    op.drop_column('users', 'gold_grams')
