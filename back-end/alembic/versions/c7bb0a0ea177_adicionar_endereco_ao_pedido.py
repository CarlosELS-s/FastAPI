"""adicionar endereco ao pedido

Revision ID: c7bb0a0ea177
Revises: 763b74b00f08
Create Date: 2026-09-13 18:49:48.554093

"""

from typing import Sequence, Union


revision: str = "c7bb0a0ea177"
down_revision: Union[str, Sequence[str], None] = "763b74b00f08"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # As colunas do endereço já existem no banco.
    pass


def downgrade() -> None:
    # Não remover as colunas existentes.
    pass