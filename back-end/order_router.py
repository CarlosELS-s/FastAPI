from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependecies import pegar_sessao, verificar_token
from models import *
from schemas import *
from typing import List
from datetime import datetime, timedelta
import random

order_router = APIRouter(prefix="/pedidos", tags=["pedidos"], dependencies=[Depends(verificar_token)])

def pode_gerenciar_pedido(usuario, pedido):
    return usuario.admin or usuario.funcao == "dono" or usuario.id == pedido.usuario

def pode_cozinha(usuario):
    return usuario.admin or usuario.funcao in ["dono", "cozinheiro"]

def pode_entrega(usuario):
    return usuario.admin or usuario.funcao in ["dono", "entregador"]

@order_router.get("/")
async def get_orders():
    return {"message": "lista de pedidos"}

@order_router.post("/pedido")
async def criar_pedido(usuario: Usuario = Depends(verificar_token), session: Session = Depends(pegar_sessao)):
    novo_pedido = Pedido(usuario=usuario.id)
    session.add(novo_pedido)
    session.commit()
    session.refresh(novo_pedido)
    return {"message": "Pedido criado com sucesso", "id": novo_pedido.id}

@order_router.post("/pedido/Pronto/{id_pedido}")
async def marcarPedidoPronto(id_pedido: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if pedido.status.upper() != "FINALIZADO":
        raise HTTPException(status_code=400, detail="Pedido não pode ser alterado!")
    if not pode_cozinha(usuario):
        raise HTTPException(status_code=403, detail="Você não tem autorização para fazer essa operação")
    pedido.status = "PRONTO"
    session.commit()
    session.refresh(pedido)
    return {"mensagem": "Pedido pronto para entrega"}

@order_router.post("/pedido/cancelar/{id_pedido}")
async def cancelar_pedido(id_pedido: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if not pode_gerenciar_pedido(usuario, pedido):
        raise HTTPException(status_code=403, detail="Você não tem autorização para cancelar este pedido")

    status_atual = pedido.status.upper()

    if status_atual not in ["PENDENTE", "FINALIZADO"]:
        raise HTTPException(status_code=400, detail="Pedido não pode ser cancelado neste status")

    if status_atual == "PENDENTE":
        pedido.multa = 0
        pedido.preco = 0
        pedido.status = "CANCELADO"
        session.commit()
        session.refresh(pedido)
        return {
            "mensagem": "Pedido cancelado com sucesso",
            "pedido": pedido,
            "multa": 0,
            "pagamento_multa": False
        }

    if not pedido.data_finalizacao:
        raise HTTPException(status_code=400, detail="Este pedido não possui data de finalização")

    tempo_finalizado = datetime.now() - pedido.data_finalizacao

    if tempo_finalizado <= timedelta(minutes=15):
        pedido.multa = 0
        pedido.preco = 0
        pedido.status = "CANCELADO"
        session.commit()
        session.refresh(pedido)
        return {
            "mensagem": "Pedido cancelado sem multa",
            "pedido": pedido,
            "multa": 0,
            "pagamento_multa": False
        }

    pedido.multa = float(pedido.preco or 0) * 0.5
    session.commit()
    session.refresh(pedido)

    return {
        "mensagem": "O cancelamento possui multa",
        "pedido": pedido,
        "multa": pedido.multa,
        "pagamento_multa": True
    }

@order_router.get("/listar")
async def listar_todos_pedidos(
    session: Session = Depends(pegar_sessao),
    usuario: Usuario = Depends(verificar_token)
):
    if usuario.funcao not in ["dono", "cozinheiro", "entregador"] and not usuario.admin:
        raise HTTPException(status_code=403, detail="Você não tem autorização para visualizar os pedidos")
    return {"pedidos": session.query(Pedido).all()}

@order_router.post("/remover-item/{id_item_pedido}")
async def remover_item_pedido(id_item_pedido: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    item_pedido = session.query(ItenPedido).filter(ItenPedido.id == id_item_pedido).first()
    if not item_pedido:
        raise HTTPException(status_code=404, detail="Item do pedido não encontrado")

    pedido = session.query(Pedido).filter(Pedido.id == item_pedido.pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if not pode_gerenciar_pedido(usuario, pedido):
        raise HTTPException(status_code=403, detail="Você não tem autorização para fazer essa operação")

    if pedido.status.upper() != "PENDENTE":
        raise HTTPException(status_code=400, detail="Pedido não pode ser alterado")

    session.delete(item_pedido)
    session.flush()
    pedido.calcular_preco()
    session.commit()
    return {"mensagem": "Item removido com sucesso"}

@order_router.post("/adicionar-item/{id_pedido}")
async def adicionar_item_pedido(id_pedido: int, item_pedido_schema: ItemPedidoSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não existente.")
    if pedido.status.upper() != "PENDENTE":
        raise HTTPException(status_code=400, detail="Pedido não pode ser alterado.")
    if not pode_gerenciar_pedido(usuario, pedido):
        raise HTTPException(status_code=403, detail="Você não tem autorização para alterar este pedido")
    if item_pedido_schema.quantidade < 1:
        raise HTTPException(status_code=400, detail="A quantidade precisa ser pelo menos 1.")

    nome_produto = item_pedido_schema.sabor.strip()
    tamanho_informado = item_pedido_schema.tamanho.strip()

    produto = session.query(Produto).filter(Produto.nome == nome_produto).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    if not produto.disponivel:
        raise HTTPException(status_code=400, detail="Este produto está indisponível.")

    tamanho = session.query(ProdutoTamanho).filter(
        ProdutoTamanho.produto_id == produto.id,
        ProdutoTamanho.tamanho == tamanho_informado
    ).first()

    if not tamanho:
        raise HTTPException(status_code=404, detail="Tamanho não encontrado para este produto.")
    if tamanho.estoque <= 0:
        raise HTTPException(status_code=400, detail="Este produto está esgotado.")
    if item_pedido_schema.quantidade > tamanho.estoque:
        raise HTTPException(
            status_code=400,
            detail=f"Estoque insuficiente. Disponível: {tamanho.estoque}."
        )

    preco_unitario = tamanho.preco
    item_pedido = ItenPedido(
        item_pedido_schema.quantidade,
        nome_produto,
        tamanho_informado,
        preco_unitario,
        id_pedido
    )

    session.add(item_pedido)
    tamanho.estoque -= item_pedido_schema.quantidade
    session.flush()
    pedido.calcular_preco()
    session.commit()
    session.refresh(item_pedido)
    session.refresh(pedido)
    session.refresh(tamanho)

    return {
        "mensagem": "Item criado com sucesso.",
        "item_id": item_pedido.id,
        "produto": produto.nome,
        "tamanho": tamanho.tamanho,
        "quantidade": item_pedido.quantidade,
        "preco_unitario": item_pedido.preco_unitario,
        "estoque_restante": tamanho.estoque,
        "preco_do_pedido": pedido.preco
    }

@order_router.post("/pedido/finalizar/{id_pedido}")
async def finalizar_pedido(id_pedido: int, pagamento_schema: PagamentosSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if pedido.status.upper() != "PENDENTE":
        raise HTTPException(status_code=400, detail="Pedido não pode ser alterado!")
    if not pode_gerenciar_pedido(usuario, pedido):
        raise HTTPException(status_code=403, detail="Você não tem autorização para fazer essa operação")
    if not pedido.itens:
        raise HTTPException(status_code=400, detail="O pedido precisa ter pelo menos um item")

    pedido.pagamento = pagamento_schema.forma_pagamento
    pedido.status = "FINALIZADO"
    pedido.data_finalizacao = datetime.now()

    session.commit()
    session.refresh(pedido)

    return {
        "mensagem": f"Pedido número: {pedido.id} finalizado com sucesso",
        "pedido": pedido,
        "pagamento": pedido.pagamento
    }

@order_router.get("/pedido/{id_pedido}")
async def visualizar_pedido(id_pedido: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if not pode_gerenciar_pedido(usuario, pedido):
        raise HTTPException(status_code=403, detail="Você não tem autorização para visualizar este pedido")

    return {
        "quantidade_iten_pedido": len(pedido.itens),
        "pedido": pedido
    }

@order_router.get("/listar/pedidos-usuario", response_model=List[ResponsePedidoSchema])
async def listar_pedidos_usuario(session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    return session.query(Pedido).filter(Pedido.usuario == usuario.id).all()

@order_router.get("/informacao-usuario/{id_usuario}")
async def info_usuario(id_usuario: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    usuario_buscado = session.query(Usuario).filter(Usuario.id == id_usuario).first()

    if not usuario_buscado:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    return {
        "id": usuario_buscado.id,
        "nome": usuario_buscado.nome,
        "email": usuario_buscado.email,
        "telefone": usuario_buscado.telefone,
        "ativo": usuario_buscado.ativo,
        "email_verificado": usuario_buscado.email_verificado,
        "telefone_verificado": getattr(usuario_buscado, "telefone_verificado", False)
    }

@order_router.post("/Em-entrega/{id_pedido}")
async def entrega(id_pedido: int, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if pedido.status.upper() != "PRONTO":
        raise HTTPException(status_code=400, detail="Pedido não está pronto!")
    if not pode_entrega(usuario):
        raise HTTPException(status_code=403, detail="Você não tem autorização para fazer essa operação")

    while True:
        codigo = str(random.randint(100000, 999999))
        codigo_existente = session.query(Pedido).filter(Pedido.codigo_entrega == codigo).first()
        if not codigo_existente:
            break

    pedido.codigo_entrega = codigo
    pedido.status = "EM_ENTREGA"

    session.commit()
    session.refresh(pedido)

    return {
        "mensagem": "Pedido em rota de entrega",
        "codigo_entrega": pedido.codigo_entrega,
        "pedido": pedido
    }

@order_router.put("/pedido/endereco/{id_pedido}")
async def adicionar_endereco(id_pedido: int, endereco: EnderecoSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if not pode_gerenciar_pedido(usuario, pedido):
        raise HTTPException(status_code=403, detail="Você não tem autorização para alterar este pedido")

    pedido.cep = endereco.cep
    pedido.rua = endereco.rua
    pedido.numero = endereco.numero
    pedido.bairro = endereco.bairro
    pedido.complemento = endereco.complemento

    session.commit()
    session.refresh(pedido)

    return {
        "mensagem": "Endereço adicionado com sucesso",
        "pedido": pedido
    }

@order_router.post("/entregue/{id_pedido}")
async def pedido_entregue(id_pedido: int, codigo_schema: CodigoEntregaSchema, session: Session = Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if not pode_entrega(usuario):
        raise HTTPException(status_code=403, detail="Você não tem autorização para fazer essa operação")
    if pedido.status.upper() != "EM_ENTREGA":
        raise HTTPException(status_code=400, detail="Pedido não está em entrega")

    codigo_informado = codigo_schema.codigo.strip()
    codigo_cadastrado = str(pedido.codigo_entrega or "").strip()

    if codigo_informado != codigo_cadastrado:
        raise HTTPException(status_code=400, detail="Código de entrega inválido")

    pedido.status = "ENTREGUE"
    session.commit()
    session.refresh(pedido)

    return {
        "mensagem": "Pedido entregue com sucesso",
        "pedido": pedido
    }