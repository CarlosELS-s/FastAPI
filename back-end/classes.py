import os
import smtplib
from email.message import EmailMessage


class Enviar_Email:

    def __init__(
        self,
        email_destino: str,
        codigo: int
    ):
        self.remetente = os.getenv("EMAIL_REMETENTE")
        self.__senha = os.getenv("EMAIL_SENHA")
        destinatario = email_destino
                
        print("EMAIL:", os.getenv("EMAIL_REMETENTE"))
        print("SENHA EXISTE:", bool(os.getenv("EMAIL_SENHA")))
        print("TAMANHO DA SENHA:", len(os.getenv("EMAIL_SENHA") or ""))
        if not self.remetente:
            raise Exception(
                "EMAIL_REMETENTE não foi configurado no .env"
            )

        if not self.__senha:
            raise Exception(
                "EMAIL_SENHA não foi configurado no .env"
            )

        mensagem = EmailMessage()

        mensagem["Subject"] = "Código de verificação"
        mensagem["From"] = self.remetente
        mensagem["To"] = destinatario

        mensagem.set_content(
            f"""
Olá!

Seu código de verificação é:

{codigo}

Esse código expira em 10 minutos.

PedidoManagerS
"""
        )

        with smtplib.SMTP(
            "smtp.gmail.com",
            587
        ) as servidor:

            servidor.starttls()

            servidor.login(
                self.remetente,
                self.__senha
            )

            servidor.send_message(
                mensagem
            )

        print("E-mail enviado!")
import os
