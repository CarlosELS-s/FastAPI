from fastapi import FastAPI
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

app = FastAPI()

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from auth_router import auth_router
from order_router import order_router

app.include_router(auth_router)
app.include_router(order_router)

# para roda o codigo em terminal digite: uvicorn main:app --reload
# bibliotecas necessarias:pip install fastapi uicorn sqlalchemy passlib[bcrypt] python-jose[cryptography] python-dotenv python-multipart