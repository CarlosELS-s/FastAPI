from fastapi import APIRouter

order_router = APIRouter(prefix="/pedidos", tags=["pedidos"])

@order_router.get("/")
async def get_orders():
    return {"message": "lista de pedidos"}