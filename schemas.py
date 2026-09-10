from pydantic import BaseModel
from typing import Optional

class UsuarioSchema(BaseModel):
    nome: str
    email: str
    senha: str
    adm: Optional[bool] = False
    ativo: Optional[bool] = True

    class Config:
        from_attributes = True

class PedididoSchema(BaseModel):
    usuario: int

    class Config:
        from_attributes = True

class loginSchema(BaseModel):
    email: str
    senha: str

    class Config:
        from_attributes = True

class ItemPedidoSchema(BaseModel):
    quantidade: int
    sabor: str
    tamanho: str
    preco_unitario: float

    class config:
        from_attributes = True
