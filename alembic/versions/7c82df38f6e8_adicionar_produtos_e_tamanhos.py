"""adicionar produtos e tamanhos

Revision ID: 7c82df38f6e8
Revises: ec7b5081d974
Create Date: 2026-09-17 20:02:12.536191

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c82df38f6e8"
down_revision: Union[str, Sequence[str], None] = "ec7b5081d974"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "produtos",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True
        ),
        sa.Column(
            "nome",
            sa.String(),
            nullable=False
        ),
        sa.Column(
            "categoria",
            sa.String(),
            nullable=False
        ),
        sa.Column(
            "descricao",
            sa.String(),
            nullable=True
        ),
        sa.Column(
            "imagem",
            sa.String(),
            nullable=True
        ),
        sa.Column(
            "disponivel",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        ),
    )

    op.create_table(
        "produto_tamanhos",
        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            autoincrement=True
        ),
        sa.Column(
            "produto_id",
            sa.Integer(),
            nullable=False
        ),
        sa.Column(
            "tamanho",
            sa.String(),
            nullable=False
        ),
        sa.Column(
            "preco",
            sa.Float(),
            nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["produto_id"],
            ["produtos.id"],
            ondelete="CASCADE"
        ),
    )


def downgrade() -> None:
    op.drop_table("produto_tamanhos")
    op.drop_table("produtos")