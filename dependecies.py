from fastapi import Depends, HTTPException
from sqlalchemy.orm import sessionmaker, Session
from models import db, Usuario
from jose import jwt,JWTError
from main import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer

oauth_schema  =OAuth2PasswordBearer(tokenUrl="auth/login-form")

def pegar_sessao():
    try:
        Session = sessionmaker(bind=db)
        session = Session()
        yield session
    finally:
        session.close()

def verificar_token(token: str  = Depends(oauth_schema), session: Session = Depends(pegar_sessao)):
    try:
        dic_inf = jwt.decode(token, SECRET_KEY, ALGORITHM)
        id_usuario = int(dic_inf.get("sub"))
    except JWTError as erro:
        print(erro)
        raise HTTPException(status_code=401, detail="Acesso Negado")
    # verifica se o token é valido
    # extrair o ID o usuario do token
    usuario = session.query(Usuario).filter(Usuario.id==id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Acesso  Invalido")
    return usuario