from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import declarative_base

#conexão com o banco de dados
db = create_engine('sqlite:///banco.db')

#criar a base do banco de dados
base = declarative_base()

#criar as tabelas do banco de dados

# usuario
class Usuario(base):
    __tablename__ = "usuarios"

    id = Column("id", Integer, primary_key=True,autoincrement=True)
    nome = Column("nome", String)
    email = Column("email", String, nullable=False)
    senha = Column("senha", String)
    ativo = Column("ativo", Boolean)
    admin = Column("admin", Boolean, default=False)

    def __init__(self, nome, email, senha, ativo = True, admin = False):
        self.nome = nome
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.admin = admin
# pedido
class Pedido(base):
    __tablename__ = "pedidos"

    #SATUS_CHOICES = [
    #    ("pendente", "Pendente"),
    #    ("cancelado", "Cancelado"),
    #    ("finalizado", "Finalizado")
    #]

    id = Column("id", Integer, primary_key=True,autoincrement=True)
    status = Column("status", String, default="pendente")
    usuario = Column("usuario", ForeignKey("usuarios.id"))
    preco = Column("preco", Float)


    def __init__(self,usuario,status = "pendente", preco = 0):
        self.status = status
        self.usuario = usuario
        self.preco = preco
# itensPedidos
class ItenPedido(base):
    __tablename__ = "itens_Pedidos"

    id = Column("id", Integer, primary_key=True,autoincrement=True)
    Quantidade = Column("quantidade", Integer)
    sabor = Column("sabor", String)
    tamanho = Column("tamanho", String)
    preco_unitario = Column("preco_unitario", Float)
    pedido = Column("pedido", ForeignKey("pedidos.id"))

    def __init__(self, quantidade, sabor, tamanho, preco_unitario, pedido):
        self.quantidade = quantidade
        self.sabor = sabor
        self.tamanho = tamanho
        self.preco_unitario = preco_unitario
        self.pedido = pedido

#executar a criaçao dos metadados do seu banco de dados (criar efetivamente o banco de dados)
