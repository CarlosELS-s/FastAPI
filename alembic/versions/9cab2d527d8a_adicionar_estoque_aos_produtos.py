"""adicionar estoque aos produtos

Revision ID: COLOQUE_O_ID_AQUI
Revises: 7c82df38f6e8
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "COLOQUE_O_ID_AQUI"
down_revision: Union[str, Sequence[str], None] = "7c82df38f6e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("produto_tamanhos", sa.Column("estoque", sa.Integer(), nullable=True, server_default="0"))


def downgrade() -> None:
    op.drop_column("produto_tamanhos", "estoque")