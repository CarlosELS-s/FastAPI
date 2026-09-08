from pydantic import BaseModel
from typing import Optional

class UsuarioSchema(BaseModel):
    nome: str
    email: str
    ativo: Optional[bool] = True

    class Config:
        from_attributes = True
