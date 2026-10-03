from fastapi import APIRouter, Depends, HTTPException
from models import Usuario
from dependecies import pegar_sessao, verificar_token
from main import bcrypt_context, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from schemas import *
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm
import random
from classes import Enviar_Email

auth_router = APIRouter(prefix="/auth", tags=["auth"])
codigos_telefone = {}

def gerar_codigo_telefone(usuario_id: int):
    codigo = str(random.randint(100000, 999999))

    codigos_telefone[usuario_id] = {
        "codigo": codigo,
        "expira": datetime.now() + timedelta(minutes=10)
    }

    print("=" * 50)
    print(f"CÓDIGO DE VERIFICAÇÃO DO USUÁRIO {usuario_id}: {codigo}")
    print("=" * 50)

    return codigo

def validar_codigo_telefone(usuario_id: int, codigo: str):
    dados = codigos_telefone.get(usuario_id)

    if not dados:
        return False, "Nenhum código foi solicitado."

    if datetime.now() > dados["expira"]:
        codigos_telefone.pop(usuario_id, None)
        return False, "O código expirou."

    if codigo != dados["codigo"]:
        return False, "Código inválido."

    codigos_telefone.pop(usuario_id, None)

    return True, "Telefone verificado com sucesso."

def criar_token(
    id_usuario,
    admin=False,
    duracao_token=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
):
    data_expiracao = datetime.now(timezone.utc) + duracao_token

    dic_info = {
        "sub": str(id_usuario),
        "admin": bool(admin),
        "exp": data_expiracao,
    }

    jwt_codificado = jwt.encode(
        dic_info,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return jwt_codificado

def autenticar_usuario(
    nome,
    telefone,
    senha,
    session
):
    usuario = (
        session.query(Usuario)
        .filter(
            Usuario.nome == nome,
            Usuario.telefone == telefone
        )
        .first()
    )

    if not usuario:
        return None

    # Usuário normal não precisa de senha
    if not usuario.admin:
        return usuario

    # Administrador precisa ter senha
    if not senha:
        return None

    if not usuario.senha:
        return None

    if not bcrypt_context.verify(
        senha,
        usuario.senha
    ):
        return None

    return usuario

@auth_router.get("/")
async def home():
    """
    Endpoint para autenticar um usuário.
    """
    return {"message": "autenticando usuario", "status": False}
@auth_router.post("/criar_conta")
async def criar_conta(
    usuario_schema: UsuarioSchema,
    session: Session = Depends(pegar_sessao),
):
    usuario_existente = (
        session.query(Usuario)
        .filter(
            Usuario.telefone == usuario_schema.telefone
        )
        .first()
    )

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="Já existe um usuário com esse telefone",
        )
    if usuario_schema.adm and not usuario_schema.senha:
        raise HTTPException(
            status_code=400,
            detail="Administrador precisa ter uma senha",
        )
    senha_criptografada = None
    if usuario_schema.senha:
        senha_criptografada = bcrypt_context.hash(
            usuario_schema.senha
        )

    novo_usuario = Usuario(
        nome=usuario_schema.nome,
        telefone=usuario_schema.telefone,
        email=f"{usuario_schema.telefone}@usuario.local",
        senha=senha_criptografada,
        ativo=usuario_schema.ativo,
        admin=usuario_schema.adm,
    )

    session.add(novo_usuario)
    session.commit()
    session.refresh(novo_usuario)
    gerar_codigo_telefone(novo_usuario.id)

    return {
        "message": "Usuário criado com sucesso. Verifique o telefone com o código enviado no terminal.",
        "id": novo_usuario.id,
        "nome": novo_usuario.nome,
        "email": novo_usuario.email,
        "telefone": novo_usuario.telefone,
        "admin": novo_usuario.admin,
        "telefone_verificado": novo_usuario.telefone_verificado,
    }

# login -> email e senha -> tokenJWt (Json web token) aadfffhjdlçkjfkjaoidjl14654safdf
@auth_router.post("/login")
async def login(
    login_schema: loginSchema,
    session: Session = Depends(pegar_sessao)
):
    usuario = None

    # ==========================================
    # LOGIN POR E-MAIL
    # ==========================================
    if login_schema.email:
        email = login_schema.email.strip().lower()

        usuario = (
            session.query(Usuario)
            .filter(
                Usuario.email == email
            )
            .first()
        )

        if not usuario:
            raise HTTPException(
                status_code=400,
                detail="E-mail não encontrado."
            )

        # E-mail precisa estar verificado
        if not usuario.email_verificado:
            raise HTTPException(
                status_code=400,
                detail="Este e-mail ainda não foi verificado."
            )

    # ==========================================
    # LOGIN POR TELEFONE
    # ==========================================
    else:
        if (
            not login_schema.nome
            or login_schema.telefone is None
        ):
            raise HTTPException(
                status_code=400,
                detail="Informe nome e telefone."
            )

        usuario = (
            session.query(Usuario)
            .filter(
                Usuario.nome == login_schema.nome,
                Usuario.telefone == login_schema.telefone
            )
            .first()
        )

        if not usuario:
            raise HTTPException(
                status_code=400,
                detail="Nome ou telefone não encontrado."
            )

    # ==========================================
    # USUÁRIO INATIVO
    # ==========================================
    if not usuario.ativo:
        raise HTTPException(
            status_code=400,
            detail="Este usuário está inativo."
        )

    # ==========================================
    # ADMINISTRADOR
    # ==========================================
    if usuario.admin:

        if not login_schema.senha:
            return {
                "senha_obrigatoria": True,
                "admin": True
            }

        if not usuario.senha:
            raise HTTPException(
                status_code=400,
                detail="Administrador não possui senha cadastrada."
            )

        if not bcrypt_context.verify(
            login_schema.senha,
            usuario.senha
        ):
            raise HTTPException(
                status_code=400,
                detail="Senha do administrador incorreta."
            )
    if not usuario.telefone_verificado:
        raise HTTPException(
            status_code=400,
            detail="Seu telefone ainda não foi verificado."
        )
    # ==========================================
    # TOKEN
    # ==========================================
    access_token = criar_token(
        id_usuario=usuario.id,
        admin=usuario.admin
    )

    refresh_token = criar_token(
        id_usuario=usuario.id,
        admin=usuario.admin,
        duracao_token=timedelta(days=7)
    )

    return {
        "refresh_token": refresh_token,
        "access_token": access_token,
        "token_type": "bearer"
    }
    
@auth_router.post("/login-form")
async def login_form(dados_formulario: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(pegar_sessao)):
    usuario = session.query(Usuario).filter(Usuario.nome == dados_formulario.username).first()

    if not usuario:
        raise HTTPException(status_code=400, detail="Usuário não encontrado.")

    if not usuario.ativo:
        raise HTTPException(status_code=400, detail="Este usuário está inativo.")

    if usuario.admin:
        if not usuario.senha:
            raise HTTPException(status_code=400, detail="Administrador não possui senha cadastrada.")

        if not bcrypt_context.verify(dados_formulario.password, usuario.senha):
            raise HTTPException(status_code=400, detail="Senha inválida.")

    access_token = criar_token(usuario.id, admin=usuario.admin)

    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.get("/refresh")
async def use_refresh_token(usuario_atual: Usuario = Depends(verificar_token)):
    access_token = criar_token(usuario_atual.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
        }

@auth_router.delete("/usuarios/{usuario_id}")
async def deletar_usuario(usuario_id: int, session: Session = Depends(pegar_sessao),usuario_atual: Usuario = Depends(verificar_token)):
    # 1. Busca o usuário pelo ID recebido na URL
    usuario = session.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    # 2. Se o usuário não existir, retorna um erro 404
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if not  usuario.admin:
        raise HTTPException(status_code=401, detail="Você não pode faser essa alteraçao")
    # 3. Remove o usuário encontrado e salva a alteração no banco
    session.delete(usuario)
    session.commit()
    
    return {"message": f"Usuário {usuario.nome} deletado com sucesso"}

@auth_router.post("/adicionar-email/{id_usuario}")
async def adicionar_email(
    id_usuario: int,
    email_schema: EmailSchema,
    session: Session = Depends(pegar_sessao),
    usuario_atual: Usuario = Depends(verificar_token),
):
    if usuario_atual.id != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você não pode alterar o e-mail de outro usuário."
        )

    usuario = (
        session.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    email = email_schema.email.strip().lower()

    # Gera código de 6 dígitos
    codigo = str(random.randint(100000, 999999))

    # Salva o e-mail e os dados da verificação
    usuario.email = email
    usuario.email_verificado = False
    usuario.codigo_verificacao_email = codigo
    usuario.codigo_verificacao_expira = (
        datetime.now() + timedelta(minutes=10)
    )

    session.commit()
    session.refresh(usuario)

    # Envia o código por e-mail
    try:
        Enviar_Email(
            email_destino=email,
            codigo=int(codigo)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Não foi possível enviar o código de verificação: {str(e)}"
        )

    return {
        "mensagem": "E-mail salvo e código de verificação enviado.",
        "email": usuario.email,
        "email_verificado": usuario.email_verificado,
    }
@auth_router.post("/verificar-email/{id_usuario}")
async def verificar_email(
    id_usuario: int,
    codigo_schema: CodigoEmailSchema,
    session: Session = Depends(pegar_sessao),
    usuario_atual: Usuario = Depends(verificar_token),
):
    if usuario_atual.id != id_usuario:
        raise HTTPException(
            status_code=403,
            detail="Você não pode verificar o e-mail de outro usuário."
        )

    usuario = (
        session.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    if usuario.email_verificado:
        return {
            "mensagem": "O e-mail já está verificado.",
            "email_verificado": True,
        }

    if not usuario.codigo_verificacao_email:
        raise HTTPException(
            status_code=400,
            detail="Nenhum código de verificação foi solicitado."
        )

    if not usuario.codigo_verificacao_expira:
        raise HTTPException(
            status_code=400,
            detail="Código de verificação inválido."
        )

    if datetime.now() > usuario.codigo_verificacao_expira:
        raise HTTPException(
            status_code=400,
            detail="O código de verificação expirou."
        )

    codigo_informado = codigo_schema.codigo.strip()

    if codigo_informado != usuario.codigo_verificacao_email:
        raise HTTPException(
            status_code=400,
            detail="Código de verificação incorreto."
        )

    usuario.email_verificado = True
    usuario.codigo_verificacao_email = None
    usuario.codigo_verificacao_expira = None

    session.commit()
    session.refresh(usuario)

    return {
        "mensagem": "E-mail verificado com sucesso.",
        "email": usuario.email,
        "email_verificado": True,
    }

@auth_router.get("/usuarios")
async def listar_usuarios(session: Session = Depends(pegar_sessao), usuario_atual: Usuario = Depends(verificar_token)):
    if not usuario_atual.admin:
        raise HTTPException(status_code=403, detail="Acesso permitido somente para administradores.")

    usuarios = session.query(Usuario).all()

    return [
        {
            "id": usuario.id,
            "nome": usuario.nome,
            "telefone": usuario.telefone,
            "email": usuario.email,
            "ativo": usuario.ativo,
            "admin": usuario.admin,
            "email_verificado": usuario.email_verificado
        }
        for usuario in usuarios
    ]

@auth_router.delete("/usuarios/{usuario_id}")
async def deletar_usuario(usuario_id: int, session: Session = Depends(pegar_sessao), usuario_atual: Usuario = Depends(verificar_token)):
    if not usuario_atual.admin:
        raise HTTPException(status_code=403, detail="Acesso permitido somente para administradores.")

    usuario = session.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if usuario.id == usuario_atual.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir sua própria conta.")

    session.delete(usuario)
    session.commit()

    return {"message": f"Usuário {usuario.nome} deletado com sucesso"}

@auth_router.patch("/usuarios/{usuario_id}/status")
async def alterar_status_usuario(usuario_id: int, session: Session = Depends(pegar_sessao), usuario_atual: Usuario = Depends(verificar_token)):
    if not usuario_atual.admin:
        raise HTTPException(status_code=403, detail="Acesso permitido somente para administradores.")

    usuario = session.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    if usuario.id == usuario_atual.id:
        raise HTTPException(status_code=400, detail="Você não pode desativar sua própria conta.")

    usuario.ativo = not usuario.ativo

    session.commit()
    session.refresh(usuario)

    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "telefone": usuario.telefone,
        "email": usuario.email,
        "ativo": usuario.ativo,
        "admin": usuario.admin,
        "email_verificado": usuario.email_verificado,
        "telefone_verificado": usuario.telefone_verificado
    }
@auth_router.get("/usuarios/{usuario_id}")
async def informacao_usuario_admin(usuario_id: int, session: Session = Depends(pegar_sessao), usuario_atual: Usuario = Depends(verificar_token)):
    if not usuario_atual.admin:
        raise HTTPException(status_code=403, detail="Acesso permitido somente para administradores.")

    usuario = session.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "telefone": usuario.telefone,
        "email": usuario.email,
        "ativo": usuario.ativo,
        "admin": usuario.admin,
        "email_verificado": usuario.email_verificado
    }

@auth_router.post("/verificar-telefone/{usuario_id}")
async def verificar_telefone(
    usuario_id: int,
    codigo_schema: CodigoTelefoneSchema,
    session: Session = Depends(pegar_sessao),
):
    usuario = (
        session.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    valido, mensagem = validar_codigo_telefone(
        usuario_id,
        codigo_schema.codigo
    )

    if not valido:
        raise HTTPException(
            status_code=400,
            detail=mensagem
        )

    usuario.telefone_verificado = True

    session.commit()
    session.refresh(usuario)

    return {
        "message": "Telefone verificado com sucesso.",
        "telefone_verificado": True,
    }
@auth_router.post("/reenviar-codigo-telefone/{usuario_id}")
async def reenviar_codigo_telefone(
    usuario_id: int,
    session: Session = Depends(pegar_sessao),
):
    usuario = (
        session.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    gerar_codigo_telefone(usuario.id)

    return {
        "message": "Novo código gerado."
    }
