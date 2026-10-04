import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL não foi configurada")

db = create_engine(DATABASE_URL)

base = declarative_base()

class Usuario(base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String)
    email = Column(String)
    telefone = Column(Integer, nullable=False)
    senha = Column(String, nullable=True)
    ativo = Column(Boolean, default=True)
    admin = Column(Boolean, default=False)
    funcao = Column(String, default="cliente", nullable=False)
    telefone_verificado = Column(Boolean, default=False)
    email_verificado = Column(Boolean, default=False)
    codigo_verificacao_email = Column(String, nullable=True)
    codigo_verificacao_expira = Column(DateTime, nullable=True)

    def __init__(self, nome, telefone, email=None, senha=None, ativo=True, admin=False, funcao="cliente"):
        self.nome = nome
        self.telefone = telefone
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.admin = admin
        self.funcao = funcao

class Pedido(base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(String, default="pendente")
    usuario = Column(ForeignKey("usuarios.id"))
    preco = Column(Float)
    itens = relationship("ItenPedido", cascade="all, delete")
    data_finalizacao = Column(DateTime, nullable=True)
    cep = Column(String, nullable=True)
    rua = Column(String, nullable=True)
    numero = Column(String, nullable=True)
    bairro = Column(String, nullable=True)
    complemento = Column(String, nullable=True)
    pagamento = Column(String, nullable=True)
    multa = Column(Float, default=0)
    codigo_entrega = Column(String)

    def __init__(self, usuario, status="pendente", preco=0):
        self.status = status
        self.usuario = usuario
        self.preco = preco

    def calcular_preco(self):
        self.preco = sum(item.preco_unitario * item.quantidade for item in self.itens)

class ItenPedido(base):
    __tablename__ = "itens_Pedidos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quantidade = Column(Integer)
    sabor = Column(String)
    tamanho = Column(String)
    preco_unitario = Column(Float)
    pedido = Column(ForeignKey("pedidos.id"))

    def __init__(self, quantidade, sabor, tamanho, preco_unitario, pedido):
        self.quantidade = quantidade
        self.sabor = sabor
        self.tamanho = tamanho
        self.preco_unitario = preco_unitario
        self.pedido = pedido

class Produto(base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    descricao = Column(String, nullable=True)
    imagem = Column(String, nullable=True)
    disponivel = Column(Boolean, default=True, nullable=False)
    tamanhos = relationship("ProdutoTamanho", back_populates="produto", cascade="all, delete-orphan")

    def __init__(self, nome, categoria, descricao=None, imagem=None, disponivel=True):
        self.nome = nome
        self.categoria = categoria
        self.descricao = descricao
        self.imagem = imagem
        self.disponivel = disponivel

class ProdutoTamanho(base):
    __tablename__ = "produto_tamanhos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    tamanho = Column(String, nullable=False)
    preco = Column(Float, nullable=False)
    estoque = Column(Integer, default=0, nullable=False)
    produto = relationship("Produto", back_populates="tamanhos")

    def __init__(self, produto_id, tamanho, preco, estoque=0):
        self.produto_id = produto_id
        self.tamanho = tamanho
        self.preco = preco
        self.estoque = estoque