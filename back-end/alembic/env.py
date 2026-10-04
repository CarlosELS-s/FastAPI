from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from alembic import context

import sys
import os

from dotenv import load_dotenv

# Permite importar arquivos da pasta principal do projeto
sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

# Carrega o .env da pasta principal do projeto
load_dotenv(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".env"
    )
)

# Pega a URL do PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL não foi configurada")

# Configuração do Alembic
config = context.config

# Configuração dos logs
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Importa os modelos
from models import base

# Metadata usada pelo Alembic
target_metadata = base.metadata


def run_migrations_offline() -> None:
    """Executa as migrations sem criar uma conexão."""

    url = DATABASE_URL

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa as migrations usando uma conexão real."""

    connectable = create_engine(
        DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()