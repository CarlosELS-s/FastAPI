"""adicionado telefone no usuario

Revision ID: 763b74b00f08
Revises: 61f16e6b39b3
Create Date: 2026-09-13 10:40:54.318365

"""

from typing import Sequence, Union

from alembic import op


revision: str = "763b74b00f08"
down_revision: Union[str, Sequence[str], None] = "61f16e6b39b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass