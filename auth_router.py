from fastapi import APIRouter, Depends, HTTPException
from models import Usuario
from dependecies import pegar_sessao
from main import bcrypt_context
from schemas import UsuarioSchema
from sqlalchemy.orm import Session
auth_router = APIRouter(prefix="/auth", tags=["auth"])

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
        novo_usuario = Usuario(nome=usuario_schema.nome, email=usuario_schema.email, senha=senha_criptografada, ativo=usuario_schema.ativo, admin=usuario_schema.admin)
        session.add(novo_usuario)
        session.commit()
        return {"message": f"usuario criado com sucesso {usuario_schema.email}"}