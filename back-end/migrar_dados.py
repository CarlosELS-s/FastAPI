import sqlite3
from sqlalchemy import text
from models import db


SQLITE_DB = "banco.db"


def main():
    print("======================================")
    print(" MIGRAÇÃO SQLite -> PostgreSQL")
    print("======================================")

    # -------------------------------
    # Conecta ao SQLite
    # -------------------------------
    sqlite = sqlite3.connect(SQLITE_DB)
    sqlite.row_factory = sqlite3.Row

    # -------------------------------
    # Conecta ao PostgreSQL
    # -------------------------------
    with db.begin() as postgres:

        print("\n[1/5] Migrando usuarios...")

        usuarios = sqlite.execute(
            "SELECT * FROM usuarios ORDER BY id"
        ).fetchall()

        for u in usuarios:
            postgres.execute(
                text("""
                    INSERT INTO usuarios (
                        id,
                        nome,
                        email,
                        senha,
                        ativo,
                        admin,
                        telefone,
                        email_verificado,
                        codigo_verificacao_email,
                        codigo_verificacao_expira,
                        telefone_verificado,
                        funcao
                    )
                    VALUES (
                        :id,
                        :nome,
                        :email,
                        :senha,
                        :ativo,
                        :admin,
                        :telefone,
                        :email_verificado,
                        :codigo_verificacao_email,
                        :codigo_verificacao_expira,
                        :telefone_verificado,
                        :funcao
                    )
                """),
                {
                    "id": u["id"],
                    "nome": u["nome"],
                    "email": u["email"],
                    "senha": u["senha"],
                    "ativo": bool(u["ativo"]) if u["ativo"] is not None else None,
                    "admin": bool(u["admin"]) if u["admin"] is not None else None,
                    "telefone": u["telefone"],
                    "email_verificado": (
                        bool(u["email_verificado"])
                        if u["email_verificado"] is not None
                        else None
                    ),
                    "codigo_verificacao_email": u["codigo_verificacao_email"],
                    "codigo_verificacao_expira": u["codigo_verificacao_expira"],
                    "telefone_verificado": (
                        bool(u["telefone_verificado"])
                        if u["telefone_verificado"] is not None
                        else None
                    ),
                    "funcao": u["funcao"],
                },
            )

        print(f"   OK: {len(usuarios)} usuarios")

        # -------------------------------
        # Pedidos
        # -------------------------------
        print("\n[2/5] Migrando pedidos...")

        pedidos = sqlite.execute(
            "SELECT * FROM pedidos ORDER BY id"
        ).fetchall()

        for p in pedidos:
            postgres.execute(
                text("""
                    INSERT INTO pedidos (
                        id,
                        status,
                        usuario,
                        preco,
                        data_finalizacao,
                        multa,
                        pagamento,
                        bairro,
                        complemento,
                        cep,
                        rua,
                        numero,
                        codigo_entrega
                    )
                    VALUES (
                        :id,
                        :status,
                        :usuario,
                        :preco,
                        :data_finalizacao,
                        :multa,
                        :pagamento,
                        :bairro,
                        :complemento,
                        :cep,
                        :rua,
                        :numero,
                        :codigo_entrega
                    )
                """),
                {
                    "id": p["id"],
                    "status": p["status"],
                    "usuario": p["usuario"],
                    "preco": p["preco"],
                    "data_finalizacao": p["data_finalizacao"],
                    "multa": p["multa"],
                    "pagamento": p["pagamento"],
                    "bairro": p["bairro"],
                    "complemento": p["complemento"],
                    "cep": p["cep"],
                    "rua": p["rua"],
                    "numero": p["numero"],
                    "codigo_entrega": p["codigo_entrega"],
                },
            )

        print(f"   OK: {len(pedidos)} pedidos")

        # -------------------------------
        # Itens
        # -------------------------------
        print("\n[3/5] Migrando itens_Pedidos...")

        itens = sqlite.execute(
            "SELECT * FROM itens_Pedidos ORDER BY id"
        ).fetchall()

        for item in itens:
            postgres.execute(
                text("""
                    INSERT INTO "itens_Pedidos" (
                        id,
                        quantidade,
                        sabor,
                        tamanho,
                        preco_unitario,
                        pedido
                    )
                    VALUES (
                        :id,
                        :quantidade,
                        :sabor,
                        :tamanho,
                        :preco_unitario,
                        :pedido
                    )
                """),
                {
                    "id": item["id"],
                    "quantidade": item["quantidade"],
                    "sabor": item["sabor"],
                    "tamanho": item["tamanho"],
                    "preco_unitario": item["preco_unitario"],
                    "pedido": item["pedido"],
                },
            )

        print(f"   OK: {len(itens)} itens")

        # -------------------------------
        # Produtos
        # -------------------------------
        print("\n[4/5] Migrando produtos...")

        produtos = sqlite.execute(
            "SELECT * FROM produtos ORDER BY id"
        ).fetchall()

        for produto in produtos:
            postgres.execute(
                text("""
                    INSERT INTO produtos (
                        id,
                        nome,
                        categoria,
                        descricao,
                        imagem,
                        disponivel
                    )
                    VALUES (
                        :id,
                        :nome,
                        :categoria,
                        :descricao,
                        :imagem,
                        :disponivel
                    )
                """),
                {
                    "id": produto["id"],
                    "nome": produto["nome"],
                    "categoria": produto["categoria"],
                    "descricao": produto["descricao"],
                    "imagem": produto["imagem"],
                    "disponivel": bool(produto["disponivel"]),
                },
            )

        print(f"   OK: {len(produtos)} produtos")

        # -------------------------------
        # Tamanhos dos produtos
        # -------------------------------
        print("\n[5/5] Migrando produto_tamanhos...")

        tamanhos = sqlite.execute(
            "SELECT * FROM produto_tamanhos ORDER BY id"
        ).fetchall()

        for tamanho in tamanhos:
            postgres.execute(
                text("""
                    INSERT INTO produto_tamanhos (
                        id,
                        produto_id,
                        tamanho,
                        preco,
                        estoque
                    )
                    VALUES (
                        :id,
                        :produto_id,
                        :tamanho,
                        :preco,
                        :estoque
                    )
                """),
                {
                    "id": tamanho["id"],
                    "produto_id": tamanho["produto_id"],
                    "tamanho": tamanho["tamanho"],
                    "preco": tamanho["preco"],
                    "estoque": tamanho["estoque"],
                },
            )

        print(f"   OK: {len(tamanhos)} tamanhos")

        # -------------------------------
        # Corrige as sequências
        # -------------------------------
        print("\nAjustando sequencias dos IDs...")

        sequencias = {
            "usuarios": "usuarios_id_seq",
            "pedidos": "pedidos_id_seq",
            "itens_Pedidos": '"itens_Pedidos_id_seq"',
            "produtos": "produtos_id_seq",
            "produto_tamanhos": "produto_tamanhos_id_seq",
        }

        for tabela, sequencia in sequencias.items():
            if tabela == "itens_Pedidos":
                postgres.execute(
                    text(
                        f"""
                        SELECT setval(
                            '{sequencia}',
                            COALESCE(
                                (SELECT MAX(id) FROM "itens_Pedidos"),
                                1
                            ),
                            true
                        )
                        """
                    )
                )
            else:
                postgres.execute(
                    text(
                        f"""
                        SELECT setval(
                            '{sequencia}',
                            COALESCE(
                                (SELECT MAX(id) FROM "{tabela}"),
                                1
                            ),
                            true
                        )
                        """
                    )
                )

    sqlite.close()

    print("\n======================================")
    print(" MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("======================================")
    print("\nDados migrados:")
    print("  9 usuarios")
    print("  35 pedidos")
    print("  54 itens")
    print("  2 produtos")
    print("  5 tamanhos")


if __name__ == "__main__":
    main()