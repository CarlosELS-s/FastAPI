from fastapi import FastAPI, Request
from fastapi.responses import Response
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

app = FastAPI(
    title="Sistema de Pedidos",
    version="1.0.0",
)

bcrypt_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

frontend_url = os.getenv(
    "FRONTEND_URL",
    "https://fast-api-rho-six.vercel.app"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.100.2:5173",
    "https://fast-api-rho-six.vercel.app",
]

if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from auth_router import auth_router
from order_router import order_router
from produto_router import produto_router

app.include_router(auth_router)
app.include_router(order_router)
app.include_router(produto_router)

# para roda o codigo em terminal digite: uvicorn main:app --host 0.0.0.0 --port 8000 --reload  e em  outro terminal  npm.cmd run dev   para o front-end
# bibliotecas necessarias:pip install fastapi uicorn sqlalchemy passlib[bcrypt] python-jose[cryptography] python-dotenv python-multipart
# http://127.0.0.1:8000/docs