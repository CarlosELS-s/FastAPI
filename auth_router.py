from fastapi import APIRouter, Depends, HTTPException
from models import Usuario
from dependecies import pegar_sessao
from main import bcrypt_context, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from schemas import UsuarioSchema,  loginSchema
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

auth_router = APIRouter(prefix="/auth", tags=["auth"])

def verificar_token(token, session: Session = Depends(pegar_sessao)):
    # verifica se o token é valido
    # extrair o ID o usuario do token
    Usuario = session.query(Usuario).filter(Usuario.id==1).first()
    return Usuario

def criar_token(id_usuario, duraçao_token = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    data_expiracao =  datetime.now(timezone.utc) + duraçao_token
    dic_info = {"sub": id_usuario, "exp": data_expiracao}
    jwt_codificado = jwt.encode(dic_info, SECRET_KEY, ALGORITHM)

    return jwt_codificado

def autenticar_usuario(email,senha, session):
    usuario = session.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return False
    elif not bcrypt_context.verify(senha, usuario.senha):
        return False

    return usuario

@auth_router.post("/")
async def home():
    """
    Endpoint para autenticar um usuário.
    """
    return {"message": "autenticando usuario", "status": False}
@auth_router.post("/criar_conta")
async def criar_conta(usuario_schema: UsuarioSchema, session: Session = Depends(pegar_sessao)):
    usuario = session.query(Usuario).filter(Usuario.email == usuario_schema.email).first()
    if usuario:
        #ja existe um usuario com esse email
        raise HTTPException(status_code=400, detail="Ja existe um usuario com esse email") 
    else:
        #criar um novo usuario
        senha_criptografada = bcrypt_context.hash(usuario_schema.senha)
        novo_usuario = Usuario(nome=usuario_schema.nome, email=usuario_schema.email, senha=senha_criptografada, ativo=usuario_schema.ativo)
        session.add(novo_usuario)
        session.commit()
        return {"message": f"usuario criado com sucesso {usuario_schema.email}"}

# login -> email e senha -> tokenJWt (Json web token) aadfffhjdlçkjfkjaoidjl14654safdf
@auth_router.post("/login")
async def login(login_schema: loginSchema, session: Session = Depends(pegar_sessao)):
    usuario = autenticar_usuario(login_schema.email, login_schema.senha, session)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuario nao encontrado ou credenciais invalidas")
    else:
        access_token = criar_token(usuario.id)
        refresh_token =criar_token(usuario.id, duraçao_token=timedelta(days=7))
        return {
                "refresh_token": refresh_token,
                "access_token": access_token,
                "token_type": "bearer"
                }
@auth_router.get("/refresh")
async def use_refresh_token(token):
    #verificar um token
    Usuario = verificar_token(token)
    access_token = criar_token(Usuario.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
        }