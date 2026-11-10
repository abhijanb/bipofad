"""add savings goals

Revision ID: c1f4b8e2a7d9
Revises: a9c3e5f7b1d2
Create Date: 2026-11-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1f4b8e2a7d9'
down_revision: Union[str, Sequence[str], None] = 'a9c3e5f7b1d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create one savings goal per user and metal."""
    op.create_table(
        'savings_goals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column(
            'target_grams',
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.CheckConstraint(
            'target_grams > 0',
            name='ck_savings_goals_target_grams_positive',
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
        sa.UniqueConstraint(
            'user_id',
            'product_id',
            name='uix_savings_goals_user_product',
        ),
    )
    op.create_index(
        'ix_savings_goals_user_id',
        'savings_goals',
        ['user_id'],
    )


def downgrade() -> None:
    """Drop the savings goals table."""
    op.drop_index('ix_savings_goals_user_id', table_name='savings_goals')
    op.drop_table('savings_goals')
