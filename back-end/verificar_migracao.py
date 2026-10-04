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

    print("======================================")
    print(" VERIFICAÇÃO DA MIGRAÇÃO")
    print("======================================")

    for tabela in tabelas:
        if tabela == "itens_Pedidos":
            resultado = c.execute(
                text('SELECT COUNT(*) FROM "itens_Pedidos"')
            ).scalar()
        else:
            resultado = c.execute(
                text(f'SELECT COUNT(*) FROM "{tabela}"')
            ).scalar()

        print(f"{tabela}: {resultado}")

    print("\nPrimeiro usuário:")
    usuario = c.execute(
        text("""
            SELECT id, nome, email, telefone, funcao
            FROM usuarios
            ORDER BY id
            LIMIT 1
        """)
    ).fetchone()

    print(usuario)

    print("\nPrimeiro pedido:")
    pedido = c.execute(
        text("""
            SELECT id, status, usuario, preco
            FROM pedidos
            ORDER BY id
            LIMIT 1
        """)
    ).fetchone()

    print(pedido)

    print("\n======================================")
    print(" VERIFICAÇÃO CONCLUÍDA")
    print("======================================")