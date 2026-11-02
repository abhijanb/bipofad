"""cache silver balance on users

Revision ID: c9d4e2f7a1b3
Revises: b2f7c1a9d4e0
Create Date: 2026-11-02 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9d4e2f7a1b3'
down_revision: Union[str, Sequence[str], None] = 'b2f7c1a9d4e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the cached balance and backfill it from existing collections."""
    op.add_column(
        'users',
        sa.Column(
            'silver_grams',
            sa.Numeric(precision=14, scale=3),
            server_default=sa.text('0'),
            nullable=False,
        ),
    )
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
    """Drop the cached balance."""
    op.drop_column('users', 'silver_grams')
