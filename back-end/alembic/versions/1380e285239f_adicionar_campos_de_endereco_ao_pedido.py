"""adicionar campos de endereco ao pedido

Revision ID: 1380e285239f
Revises: b7771ddf83e7
Create Date: 2026-10-04
"""

from alembic import op
import sqlalchemy as sa


revision = "1380e285239f"
down_revision = "b7771ddf83e7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "pedidos",
        sa.Column("bairro", sa.String(), nullable=True),
    )

    op.add_column(
        "pedidos",
        sa.Column("complemento", sa.String(), nullable=True),
    )

    op.add_column(
        "pedidos",
        sa.Column("cep", sa.String(), nullable=True),
    )

    op.add_column(
        "pedidos",
        sa.Column("rua", sa.String(), nullable=True),
    )

    op.add_column(
        "pedidos",
        sa.Column("numero", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("pedidos", "numero")
    op.drop_column("pedidos", "rua")
    op.drop_column("pedidos", "cep")
    op.drop_column("pedidos", "complemento")
    op.drop_column("pedidos", "bairro")