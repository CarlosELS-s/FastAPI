from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependecies import pegar_sessao, verificar_token
from models import Pedido, Usuario
from schemas import PedididoSchema

order_router = APIRouter(prefix="/pedidos", tags=["pedidos"], dependencies=[Depends(verificar_token)])

@order_router.get("/")
async def get_orders():
    return {"message": "lista de pedidos"}

@order_router.post("/pedido")
async def criar_pedido(pedido_schema: PedididoSchema, session: Session = Depends(pegar_sessao)):
    novo_pedido = Pedido(usuario=pedido_schema.usuario)
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
    elif not usuario.admin or usuario.id != pedido.usuario:
        raise HTTPException(status_code=400,detail="Você não tem altorisação para faser essa verificação ")
    pedido.status = "CANCELADO"
    session.commit()
    return{
        "mensagen": f"Pedido número: {id_pedido} cancelado com sucesso",
        "pedido" : pedido
    }