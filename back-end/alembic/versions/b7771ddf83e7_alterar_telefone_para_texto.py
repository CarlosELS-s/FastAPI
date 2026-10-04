"""alterar telefone para texto

Revision ID: b7771ddf83e7
Revises: 2d83d3a3410f
Create Date: 2026-10-04
"""

from alembic import op
import sqlalchemy as sa


revision = "b7771ddf83e7"
down_revision = "2d83d3a3410f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "usuarios",
        "telefone",
        existing_type=sa.Integer(),
        type_=sa.String(),
        existing_nullable=True,
        postgresql_using="telefone::text",
    )


def downgrade() -> None:
    op.alter_column(
        "usuarios",
        "telefone",
        existing_type=sa.String(),
        type_=sa.Integer(),
        existing_nullable=True,
        postgresql_using="telefone::integer",
    )