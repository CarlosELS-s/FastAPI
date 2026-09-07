from fastapi import FastAPI

app = FastAPI()

from auth_router import auth_router
from order_router import order_router

app.include_router(auth_router)
app.include_router(order_router)


# para roda o codigo em terminal digite: uvicorn main:app --reload
