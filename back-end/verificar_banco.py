import sqlite3

c = sqlite3.connect("banco.db")
c.row_factory = sqlite3.Row

tabelas = [
    "usuarios",
    "pedidos",
    "itens_Pedidos",
    "produtos",
    "produto_tamanhos",
]

for tabela in tabelas:
    print("\n==============================")
    print(tabela)
    print("==============================")

    colunas = c.execute(
        f"PRAGMA table_info({tabela})"
    ).fetchall()

    print("COLUNAS:")

    for coluna in colunas:
        print(dict(coluna))

    registro = c.execute(
        f"SELECT * FROM {tabela} LIMIT 1"
    ).fetchone()

    print("\nPRIMEIRO REGISTRO:")

    if registro:
        print(dict(registro))
    else:
        print("Nenhum registro")

c.close()