from fastapi import APIRouter, Depends, HTTPException
from models import Usuario
from dependecies import pegar_sessao, verificar_token
from main import bcrypt_context, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from schemas import UsuarioSchema,  loginSchema
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm

auth_router = APIRouter(prefix="/auth", tags=["auth"])

def criar_token(id_usuario, duraçao_token = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    data_expiracao =  datetime.now(timezone.utc) + duraçao_token
    dic_info = {"sub": str(id_usuario), "exp": data_expiracao}
    jwt_codificado = jwt.encode(dic_info, SECRET_KEY, ALGORITHM)
    return jwt_codificado

def autenticar_usuario(email,senha, session):
    usuario = session.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return False
    elif not bcrypt_context.verify(senha, usuario.senha):
        return False

    return usuario

@auth_router.get("/")
async def home():
    """
    Endpoint para autenticar um usuário.
    """
    return {"message": "autenticando usuario", "status": False}
@auth_router.post("/criar_conta")
async def criar_conta(usuario_schema: UsuarioSchema,usuario_atual: Usuario = Depends(verificar_token), session: Session = Depends(pegar_sessao)):
    usuario = session.query(Usuario).filter(Usuario.email == usuario_schema.email).first()

    if usuario_schema.adm:
        if usuario_atual.admin == False:
           raise HTTPException(status_code=400,detail="Você não tem altorisação para faser essa verificação ")
    if usuario:
        #ja existe um usuario com esse email
        raise HTTPException(status_code=400, detail="Ja existe um usuario com esse email") 
    else:
        #criar um novo usuario
        senha_criptografada = bcrypt_context.hash(usuario_schema.senha)
        novo_usuario = Usuario(nome=usuario_schema.nome, email=usuario_schema.email, senha=senha_criptografada, ativo=usuario_schema.ativo,admin=usuario_schema.adm)
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
    
@auth_router.post("/login-form")
async def login_form(dados_formulario: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(pegar_sessao)):
    usuario = autenticar_usuario(dados_formulario.username, dados_formulario.password, session)
    if not usuario:
        raise HTTPException(status_code=400, detail="Usuario nao encontrado ou credenciais invalidas")
    else:
        access_token = criar_token(usuario.id)
        return {
                "access_token": access_token,
                "token_type": "bearer"
                }

@auth_router.get("/refresh")
async def use_refresh_token(usuario_atual: Usuario = Depends(verificar_token)):
    access_token = criar_token(usuario_atual.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
        }

@auth_router.delete("/usuarios/{usuario_id}")
async def deletar_usuario(usuario_id: int, session: Session = Depends(pegar_sessao)):
    # 1. Busca o usuário pelo ID recebido na URL
    usuario = session.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    # 2. Se o usuário não existir, retorna um erro 404
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # 3. Remove o usuário encontrado e salva a alteração no banco
    session.delete(usuario)
    session.commit()
    
    return {"message": f"Usuário {usuario.nome} deletado com sucesso"}