"""adicionar estoque aos produtos

Revision ID: COLOQUE_O_ID_AQUI
Revises: 7c82df38f6e8
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision = "9cab2d527d8a"
down_revision = "7c82df38f6e8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("produto_tamanhos", sa.Column("estoque", sa.Integer(), nullable=True, server_default="0"))


def downgrade() -> None:
    op.drop_column("produto_tamanhos", "estoque")