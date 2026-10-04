"""adicionar verificacao do telefone

Revision ID: e5f10e724b38
Revises: 718372276b5d
Create Date: 2026-10-02
"""

from alembic import op
import sqlalchemy as sa


revision = "e5f10e724b38"
down_revision = "718372276b5d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "usuarios",
        sa.Column(
            "telefone_verificado",
            sa.Boolean(),
            nullable=True,
            server_default=sa.text("FALSE"),
        ),
    )


def downgrade() -> None:
    op.drop_column("usuarios", "telefone_verificado")