from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependecies import pegar_sessao, verificar_token
from models import Produto, ProdutoTamanho, Usuario
from schemas import *

produto_router = APIRouter(prefix="/produtos", tags=["produtos"])


def verificar_admin(usuario: Usuario):
    if not usuario.admin:
        raise HTTPException(status_code=403, detail="Você não tem autorização para gerenciar produtos.")


@produto_router.get("/")
async def listar_produtos(session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    produtos = session.query(Produto).filter(Produto.disponivel == True).all()

    resultado = []

    for produto in produtos:
        tamanhos = []

        for tamanho in produto.tamanhos:
            tamanhos.append({"id": tamanho.id, "tamanho": tamanho.tamanho, "preco": tamanho.preco, "estoque": tamanho.estoque})

        resultado.append({
            "id": produto.id,
            "nome": produto.nome,
            "categoria": produto.categoria,
            "descricao": produto.descricao,
            "imagem": produto.imagem,
            "disponivel": produto.disponivel,
            "tamanhos": tamanhos
        })

    return resultado


@produto_router.get("/admin")
async def listar_todos_produtos(session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    produtos = session.query(Produto).all()

    resultado = []

    for produto in produtos:
        tamanhos = []

        for tamanho in produto.tamanhos:
            tamanhos.append({"id": tamanho.id, "tamanho": tamanho.tamanho, "preco": tamanho.preco, "estoque": tamanho.estoque})

        resultado.append({
            "id": produto.id,
            "nome": produto.nome,
            "categoria": produto.categoria,
            "descricao": produto.descricao,
            "imagem": produto.imagem,
            "disponivel": produto.disponivel,
            "tamanhos": tamanhos
        })

    return resultado


@produto_router.post("/")
async def criar_produto(produto_schema: ProdutoCriarSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    if not produto_schema.tamanhos:
        raise HTTPException(status_code=400, detail="O produto precisa ter pelo menos um tamanho.")

    produto = Produto(nome=produto_schema.nome.strip(), categoria=produto_schema.categoria.strip(), descricao=produto_schema.descricao, imagem=produto_schema.imagem, disponivel=produto_schema.disponivel)

    session.add(produto)
    session.flush()

    for tamanho in produto_schema.tamanhos:
        novo_tamanho = ProdutoTamanho(produto_id=produto.id, tamanho=tamanho.tamanho.strip(), preco=tamanho.preco, estoque=tamanho.estoque)
        session.add(novo_tamanho)

    session.commit()
    session.refresh(produto)

    return {"mensagem": "Produto criado com sucesso.", "produto_id": produto.id}


@produto_router.put("/{id_produto}")
async def atualizar_produto(id_produto: int, produto_schema: ProdutoAtualizarSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    produto = session.query(Produto).filter(Produto.id == id_produto).first()

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    produto.nome = produto_schema.nome.strip()
    produto.categoria = produto_schema.categoria.strip()
    produto.descricao = produto_schema.descricao
    produto.imagem = produto_schema.imagem
    produto.disponivel = produto_schema.disponivel

    session.query(ProdutoTamanho).filter(ProdutoTamanho.produto_id == id_produto).delete()

    for tamanho in produto_schema.tamanhos:
        novo_tamanho = ProdutoTamanho(produto_id=id_produto, tamanho=tamanho.tamanho.strip(), preco=tamanho.preco, estoque=tamanho.estoque)
        session.add(novo_tamanho)

    session.commit()
    session.refresh(produto)

    return {"mensagem": "Produto atualizado com sucesso.", "produto_id": produto.id}


@produto_router.patch("/{id_produto}/disponibilidade")
async def alterar_disponibilidade(id_produto: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    produto = session.query(Produto).filter(Produto.id == id_produto).first()

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    produto.disponivel = not produto.disponivel

    session.commit()
    session.refresh(produto)

    return {
        "mensagem": "Produto disponível." if produto.disponivel else "Produto indisponível.",
        "disponivel": produto.disponivel
    }

@produto_router.patch("/tamanho/{id_tamanho}")
async def alterar_preco_tamanho(id_tamanho: int, dados: ProdutoTamanhoPrecoSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    tamanho = session.query(ProdutoTamanho).filter(ProdutoTamanho.id == id_tamanho).first()

    if not tamanho:
        raise HTTPException(status_code=404, detail="Tamanho do produto não encontrado.")

    if dados.preco < 0:
        raise HTTPException(status_code=400, detail="O preço não pode ser negativo.")

    tamanho.preco = dados.preco

    session.commit()
    session.refresh(tamanho)

    return {
        "mensagem": "Preço alterado com sucesso.",
        "id": tamanho.id,
        "tamanho": tamanho.tamanho,
        "preco": tamanho.preco
    }
@produto_router.patch("/tamanho/{id_tamanho}/estoque")
async def alterar_estoque_tamanho(id_tamanho: int, dados: ProdutoTamanhoEstoqueSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    if dados.estoque < 0:
        raise HTTPException(status_code=400, detail="O estoque não pode ser negativo.")

    tamanho = session.query(ProdutoTamanho).filter(ProdutoTamanho.id == id_tamanho).first()

    if not tamanho:
        raise HTTPException(status_code=404, detail="Tamanho do produto não encontrado.")

    tamanho.estoque = dados.estoque

    session.commit()
    session.refresh(tamanho)

    return {"mensagem": "Estoque alterado com sucesso.", "id": tamanho.id, "estoque": tamanho.estoque}

@produto_router.delete("/{id_produto}")
async def remover_produto(id_produto: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    verificar_admin(usuario)

    produto = session.query(Produto).filter(Produto.id == id_produto).first()

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    session.delete(produto)
    session.commit()

    return {"mensagem": "Produto removido com sucesso."}