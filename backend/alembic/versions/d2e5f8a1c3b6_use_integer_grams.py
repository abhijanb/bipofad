"""use integer grams for all metal amounts

Revision ID: d2e5f8a1c3b6
Revises: c1f4b8e2a7d9
Create Date: 2026-11-07 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2e5f8a1c3b6'
down_revision: Union[str, Sequence[str], None] = 'c1f4b8e2a7d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert fractional grams to whole grams.

    Positive fractions round up so an existing holder never silently loses
    metal. Cached user balances are then recomputed from the converted
    collection and sale history so the cache still matches the rows.
    """
    op.drop_constraint(
        'ck_users_silver_grams_non_negative', 'users', type_='check'
    )
    op.drop_constraint(
        'ck_users_gold_grams_non_negative', 'users', type_='check'
    )
    op.drop_constraint(
        'ck_vault_collections_grams_positive',
        'vault_collections',
        type_='check',
    )
    op.drop_constraint(
        'ck_vault_sales_grams_positive', 'vault_sales', type_='check'
    )
    op.drop_constraint(
        'ck_products_min_cashout_non_negative', 'products', type_='check'
    )

    # Round up before the type change so every positive value stays positive.
    op.execute(sa.text('UPDATE users SET silver_grams = CEIL(silver_grams)'))
    op.execute(sa.text('UPDATE users SET gold_grams = CEIL(gold_grams)'))
    op.execute(sa.text('UPDATE vault_collections SET grams = CEIL(grams)'))
    op.execute(sa.text('UPDATE vault_sales SET grams = CEIL(grams)'))
    op.execute(
        sa.text(
            'UPDATE products '
            'SET min_cashout_grams = GREATEST(1, CEIL(min_cashout_grams))'
        )
    )

    op.alter_column(
        'users',
        'silver_grams',
        existing_type=sa.Numeric(precision=14, scale=3),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using='silver_grams::integer',
    )
    op.alter_column(
        'users',
        'gold_grams',
        existing_type=sa.Numeric(precision=14, scale=3),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using='gold_grams::integer',
    )
    op.alter_column(
        'vault_collections',
        'grams',
        existing_type=sa.Numeric(precision=14, scale=3),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using='grams::integer',
    )
    op.alter_column(
        'vault_sales',
        'grams',
        existing_type=sa.Numeric(precision=14, scale=3),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using='grams::integer',
    )
    op.alter_column(
        'products',
        'min_cashout_grams',
        existing_type=sa.Numeric(precision=14, scale=3),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using='min_cashout_grams::integer',
    )

    # Rebuild the cached balances from the converted history.
    for code, column in (('SILVER', 'silver_grams'), ('GOLD', 'gold_grams')):
        op.execute(
            sa.text(
                f"""
                UPDATE users u
                SET {column} = GREATEST(
                    0,
                    COALESCE(
                        (
                            SELECT SUM(v.grams)
                            FROM vault_collections v
                            JOIN products p ON p.id = v.product_id
                            WHERE v.user_id = u.id AND p.code = '{code}'
                        ),
                        0
                    )
                    - COALESCE(
                        (
                            SELECT SUM(s.grams)
                            FROM vault_sales s
                            JOIN products p ON p.id = s.product_id
                            WHERE s.user_id = u.id AND p.code = '{code}'
                        ),
                        0
                    )
                )
                """
            )
        )

    op.create_check_constraint(
        'ck_users_silver_grams_non_negative',
        'users',
        'silver_grams >= 0',
    )
    op.create_check_constraint(
        'ck_users_gold_grams_non_negative',
        'users',
        'gold_grams >= 0',
    )
    op.create_check_constraint(
        'ck_vault_collections_grams_positive',
        'vault_collections',
        'grams > 0',
    )
    op.create_check_constraint(
        'ck_vault_sales_grams_positive',
        'vault_sales',
        'grams > 0',
    )
    op.create_check_constraint(
        'ck_products_min_cashout_non_negative',
        'products',
        'min_cashout_grams >= 0',
    )


def downgrade() -> None:
    """Restore fractional gram columns.

    Whole grams convert to the equivalent numeric value. This cannot recover
    fractions that were rounded away on upgrade.
    """
    op.drop_constraint(
        'ck_users_silver_grams_non_negative', 'users', type_='check'
    )
    op.drop_constraint(
        'ck_users_gold_grams_non_negative', 'users', type_='check'
    )
    op.drop_constraint(
        'ck_vault_collections_grams_positive',
        'vault_collections',
        type_='check',
    )
    op.drop_constraint(
        'ck_vault_sales_grams_positive', 'vault_sales', type_='check'
    )
    op.drop_constraint(
        'ck_products_min_cashout_non_negative', 'products', type_='check'
    )

    op.alter_column(
        'users',
        'silver_grams',
        existing_type=sa.Integer(),
        type_=sa.Numeric(precision=14, scale=3),
        existing_nullable=False,
        postgresql_using='silver_grams::numeric(14,3)',
    )
    op.alter_column(
        'users',
        'gold_grams',
        existing_type=sa.Integer(),
        type_=sa.Numeric(precision=14, scale=3),
        existing_nullable=False,
        postgresql_using='gold_grams::numeric(14,3)',
    )
    op.alter_column(
        'vault_collections',
        'grams',
        existing_type=sa.Integer(),
        type_=sa.Numeric(precision=14, scale=3),
        existing_nullable=False,
        postgresql_using='grams::numeric(14,3)',
    )
    op.alter_column(
        'vault_sales',
        'grams',
        existing_type=sa.Integer(),
        type_=sa.Numeric(precision=14, scale=3),
        existing_nullable=False,
        postgresql_using='grams::numeric(14,3)',
    )
    op.alter_column(
        'products',
        'min_cashout_grams',
        existing_type=sa.Integer(),
        type_=sa.Numeric(precision=14, scale=3),
        existing_nullable=False,
        postgresql_using='min_cashout_grams::numeric(14,3)',
    )

    # Restore the original development minimums.
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

    op.create_check_constraint(
        'ck_users_silver_grams_non_negative',
        'users',
        'silver_grams >= 0',
    )
    op.create_check_constraint(
        'ck_users_gold_grams_non_negative',
        'users',
        'gold_grams >= 0',
    )
    op.create_check_constraint(
        'ck_vault_collections_grams_positive',
        'vault_collections',
        'grams > 0',
    )
    op.create_check_constraint(
        'ck_vault_sales_grams_positive',
        'vault_sales',
        'grams > 0',
    )
    op.create_check_constraint(
        'ck_products_min_cashout_non_negative',
        'products',
        'min_cashout_grams >= 0',
    )
