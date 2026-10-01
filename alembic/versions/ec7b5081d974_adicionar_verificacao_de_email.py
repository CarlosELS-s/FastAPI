"""adicionar verificacao de email

Revision ID: coloque_aqui_o_revision_da_migracao
Revises: coloque_aqui_o_down_revision
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ec7b5081d974"
down_revision: Union[str, Sequence[str], None] = "1cb655bed7a2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "usuarios",
        sa.Column(
            "email_verificado",
            sa.Boolean(),
            nullable=True,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "usuarios",
        sa.Column(
            "codigo_verificacao_email",
            sa.String(),
            nullable=True,
        ),
    )

    op.add_column(
        "usuarios",
        sa.Column(
            "codigo_verificacao_expira",
            sa.DateTime(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "usuarios",
        "codigo_verificacao_expira",
    )

    op.drop_column(
        "usuarios",
        "codigo_verificacao_email",
    )

    op.drop_column(
        "usuarios",
        "email_verificado",
    )