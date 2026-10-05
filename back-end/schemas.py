from pydantic import BaseModel
from typing import Optional, List


class UsuarioSchema(BaseModel):
    nome: str
    telefone: int
    email: Optional[str] = None
    senha: Optional[str] = None
    adm: Optional[bool] = False
    ativo: Optional[bool] = True

class CodigoTelefoneSchema(BaseModel):
    codigo: str
    
class loginSchema(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    senha: Optional[str] = None

    class Config:
        from_attributes = True
class PedididoSchema(BaseModel):
    usuario: int

    class Config:
        from_attributes = True

class ItemPedidoSchema(BaseModel):
    quantidade: int
    sabor: str
    tamanho: str
    preco_unitario: float

    class Config:
        from_attributes = True
class ResponsePedidoSchema(BaseModel):
    id: int
    status: str
    preco: float
    itens: List[ItemPedidoSchema]

    class Config:
        from_attributes = True

class PagamentosSchema(BaseModel):
    forma_pagamento: str

    class Config:
        from_attributes = True

class EmailSchema(BaseModel):
    email: str

    class Config:
        from_attributes = True

class EnderecoSchema(BaseModel):
    cep: str
    rua: str
    numero: str
    bairro: str
    complemento: Optional[str] = None

    class Config:
        from_attributes = True
class CodigoEntregaSchema(BaseModel):
    codigo: str
    
    class Config:
        from_attributes = True
class EmailSchema(BaseModel):
    email: str
    class Config:
        from_attributes = True


class CodigoEmailSchema(BaseModel):
    codigo: str

class ProdutoTamanhoSchema(BaseModel):
    tamanho: str
    preco: float

    class Config:
        from_attributes = True


class ProdutoTamanhoSchema(BaseModel):
    tamanho: str
    preco: float
    estoque: int = 0

    class Config:
        from_attributes = True 

    class Config:
        from_attributes = True


class ProdutoAtualizarSchema(BaseModel):
    nome: str
    categoria: str
    descricao: Optional[str] = None
    imagem: Optional[str] = None
    disponivel: bool = True
    tamanhos: List[ProdutoTamanhoSchema]

    class Config:
        from_attributes = True
class ProdutoTamanhoSchema(BaseModel):
    tamanho: str
    preco: float
    estoque: int = 0

    class Config:
        from_attributes = True
class ProdutoTamanhoPrecoSchema(BaseModel):
    preco: float

    class Config:
        from_attributes = True

class ProdutoCriarSchema(BaseModel):
    nome: str
    categoria: str
    descricao: Optional[str] = None
    imagem: Optional[str] = None
    disponivel: bool = True
    tamanhos: List[ProdutoTamanhoSchema]

    class Config:
        from_attributes = True
class ProdutoTamanhoEstoqueSchema(BaseModel):
    estoque: int

    class Config:
        from_attributes = True
class FuncaoUsuarioSchema(BaseModel):
    funcao: str
    admin: bool
    class Config:
        from_attributes = True