from fastapi import APIRouter

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/")
async def autenticar():
    return {"message": "autenticando usuario", "status": False}