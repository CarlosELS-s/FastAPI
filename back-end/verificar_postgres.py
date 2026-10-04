from models import db
from sqlalchemy import text

with db.connect() as c:
    tabelas = [
        "usuarios",
        "pedidos",
        "itens_Pedidos",
        "produtos",
        "produto_tamanhos",
    ]

    for tabela in tabelas:
        resultado = c.execute(
            text(f'SELECT COUNT(*) FROM "{tabela}"')
        ).scalar()

        print(f"{tabela}: {resultado}")