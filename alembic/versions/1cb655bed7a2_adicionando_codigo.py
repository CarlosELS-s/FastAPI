"""adicionando codigo

Revision ID: 1cb655bed7a2
Revises: c7bb0a0ea177
Create Date: 2026-09-14 21:29:14.550888

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1cb655bed7a2"
down_revision: Union[str, Sequence[str], None] = "c7bb0a0ea177"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "pedidos",
        sa.Column(
            "codigo_entrega",
            sa.String(),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "pedidos",
        "codigo_entrega"
    )