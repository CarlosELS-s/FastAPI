from alembic import op
import sqlalchemy as sa

revision = "2fd9def0990e"
down_revision = "e5f10e724b38"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("usuarios", sa.Column("funcao", sa.String(), nullable=False, server_default="cliente"))

def downgrade():
    op.drop_column("usuarios", "funcao")