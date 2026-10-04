from models import db
from sqlalchemy import text

with db.connect() as c:
    resultado = c.execute(
        text("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'usuarios'
            ORDER BY ordinal_position
        """)
    ).fetchall()

    print("COLUNAS DA TABELA usuarios NO POSTGRES:")
    print()

    for coluna in resultado:
        print(f"{coluna[0]} -> {coluna[1]}")
