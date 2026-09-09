from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependecies import pegar_sessao
from models import Pedido
from schemas import PedididoSchema

order_router = APIRouter(prefix="/pedidos", tags=["pedidos"])

@order_router.get("/")
async def get_orders():
    return {"message": "lista de pedidos"}

@order_router.post("/pedido")
async def criar_pedido(pedido_schema: PedididoSchema, session: Session = Depends(pegar_sessao)):
    novo_pedido = Pedido(usuario=pedido_schema.usuario)
    session.add(novo_pedido)
    session.commit()
    return {"message": f"pedido criado com sucesso id do pedido: {novo_pedido.id}"}
