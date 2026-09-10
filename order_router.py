from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependecies import pegar_sessao, verificar_token
from models import Pedido, Usuario, ItenPedido
from schemas import PedididoSchema, ItemPedidoSchema

order_router = APIRouter(prefix="/pedidos", tags=["pedidos"], dependencies=[Depends(verificar_token)])

@order_router.get("/")
async def get_orders():
    return {"message": "lista de pedidos"}

@order_router.post("/pedido")
async def criar_pedido( usuario: Usuario = Depends(verificar_token), session: Session = Depends(pegar_sessao)):
    novo_pedido = Pedido(usuario=usuario.id)
    session.add(novo_pedido)
    session.commit()
    return {"message": f"pedido criado com sucesso id do pedido: {novo_pedido.id}"}

@order_router.post("/pedido/cancelar/{id_pedido}")
async def cancelar_pedido(id_pedido: int, session: Session = Depends(pegar_sessao),usuario: Usuario = Depends(verificar_token)):
    # usuario.adm = True
    # usuario.id = pedido.usuario
    pedido = session.query(Pedido).filter(Pedido.id==id_pedido).first()
    if not pedido:
        raise  HTTPException(status_code=400, detail="Pedido não encontrado")
    elif not usuario.admin:
        raise HTTPException(status_code=400,detail="Você não tem altorisação para faser essa verificação ")
    elif usuario.id != pedido.usuario:
        raise HTTPException(status_code=400,detail="Você não tem altorisação para faser essa verificação ")
    pedido.status = "CANCELADO"
    session.commit()
    return{
        "mensagen": f"Pedido número: {pedido.id} cancelado com sucesso",
        "pedido" : pedido
    }

@order_router.get("/listar")
async def listar_pedidos(session: Session = Depends(pegar_sessao),usuario: Usuario = Depends(verificar_token)):
    if not usuario.admin:
        raise HTTPException(status_code=400,detail="Você não tem altorisação para faser essa verificação ")
    else:
        pedidos = session.query(Pedido).all()
        return{
            "pedidos": pedidos
        }
@order_router.post("/adicionar-item/{id_pedido}")
async def adicionar_item_pedido(id_pedido: int,
                                item_pedido_schema: ItemPedidoSchema,
                                session: Session = Depends(pegar_sessao),
                                usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id ==id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=400, detail="Pedido não existente")
    if not usuario.admin and usuario.id != pedido.usuario:
        raise HTTPException(status_code=401, detail="Você não tem autorização para fazer essa operação")
    
    item_pedido = ItenPedido(item_pedido_schema.quantidade, item_pedido_schema.sabor,
                             item_pedido_schema.tamanho,item_pedido_schema.preco_unitario,id_pedido)
    session.add(item_pedido)
    pedido.calcular_preco()
    session.commit()
    return{
        "mensagen": "item criado  com sucesso",
        "item_id" : item_pedido.id,
        "preço do pedido"  :  pedido.preco
    }