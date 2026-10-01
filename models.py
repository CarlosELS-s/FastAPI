from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

#conexão com o banco de dados
db = create_engine('sqlite:///banco.db')

#criar a base do banco de dados
base = declarative_base()

#criar as tabelas do banco de dados

# usuario
class Usuario(base):
    __tablename__ = "usuarios"

    id = Column(
        "id",
        Integer,
        primary_key=True,
        autoincrement=True
    )

    nome = Column("nome", String)

    email = Column(
        "email",
        String,
    )

    telefone = Column(
        "telefone",
        Integer,
        nullable=False
    )

    senha = Column(
        "senha",
        String,
        nullable=True
    )

    ativo = Column(
        "ativo",
        Boolean,
        default=True
    )

    admin = Column(
        "admin",
        Boolean,
        default=False)
    email_verificado = Column(Boolean, default=False)
    codigo_verificacao_email = Column(String, nullable=True)
    codigo_verificacao_expira = Column(DateTime, nullable=True)

    def __init__(
        self,
        nome,
        telefone,
        email=None,
        senha=None,
        ativo=True,
        admin=False
    ):
        self.nome = nome
        self.telefone = telefone
        self.email = email
        self.senha = senha
        self.ativo = ativo
        self.admin = admin
# pedido
class Pedido(base):
    __tablename__ = "pedidos"

    id = Column(
        "id",
        Integer,
        primary_key=True,
        autoincrement=True)

    status = Column(
        "status",
        String,
        default="pendente")

    usuario = Column(
        "usuario",
        ForeignKey("usuarios.id"))

    preco = Column(
        "preco",
        Float)

    itens = relationship(
        "ItenPedido",
        cascade="all, delete")

    data_finalizacao = Column(
        "data_finalizacao",
        DateTime,
        nullable=True)

    cep = Column(
        "cep",
        String,
        nullable=True)

    rua = Column(
        "rua",
        String,
        nullable=True)

    numero = Column(
        "numero",
        String,
        nullable=True)

    bairro = Column(
        "bairro",
        String,
        nullable=True)

    complemento = Column(
        "complemento",
        String,
        nullable=True)

    pagamento = Column(
        "pagamento",
        String,
        nullable=True)

    multa = Column(
        "multa",
        Float,
        default=0)
    codigo_entrega = Column("codigo_entrega")

    def __init__(
        self,
        usuario,
        status="pendente",
        preco=0):
        self.status = status
        self.usuario = usuario
        self.preco = preco

    def calcular_preco(self):
        self.preco = sum(
            item.preco_unitario * item.quantidade
            for item in self.itens
        )

# itensPedidos
class ItenPedido(base):
    __tablename__ = "itens_Pedidos"

    id = Column("id", Integer, primary_key=True,autoincrement=True)
    quantidade = Column("quantidade", Integer)
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

class Produto(base):
    __tablename__ = "produtos"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    nome = Column("nome", String, nullable=False)
    categoria = Column("categoria", String, nullable=False)
    descricao = Column("descricao", String, nullable=True)
    imagem = Column("imagem", String, nullable=True)
    disponivel = Column("disponivel", Boolean, default=True, nullable=False)

    tamanhos = relationship("ProdutoTamanho", back_populates="produto", cascade="all, delete-orphan")

    def __init__(self, nome, categoria, descricao=None, imagem=None, disponivel=True):
        self.nome = nome
        self.categoria = categoria
        self.descricao = descricao
        self.imagem = imagem
        self.disponivel = disponivel


class ProdutoTamanho(base):
    __tablename__ = "produto_tamanhos"

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    produto_id = Column("produto_id", Integer, ForeignKey("produtos.id"), nullable=False)
    tamanho = Column("tamanho", String, nullable=False)
    preco = Column("preco", Float, nullable=False)
    estoque = Column("estoque", Integer, default=0, nullable=False)

    produto = relationship("Produto", back_populates="tamanhos")

    def __init__(self, produto_id, tamanho, preco, estoque=0):
        self.produto_id = produto_id
        self.tamanho = tamanho
        self.preco = preco
        self.estoque = estoque

# criar a migraçao: alembic  revision --autogenerate -m "alterar repr Pedidos"
# execultar a migração: alembic upgrade head

