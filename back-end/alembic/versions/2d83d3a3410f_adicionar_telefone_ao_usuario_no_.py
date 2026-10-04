"""adicionar telefone ao usuario no postgres

Revision ID: 2d83d3a3410f
Revises: 2fd9def0990e
Create Date: 2026-10-04
"""

from alembic import op
import sqlalchemy as sa


revision = "2d83d3a3410f"
down_revision = "2fd9def0990e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "usuarios",
        sa.Column(
            "telefone",
            sa.Integer(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("usuarios", "telefone")