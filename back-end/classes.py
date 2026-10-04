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

import os

from twilio.rest import Client


class Enviar_SMS:

    def __init__(self, telefone_destino: str, codigo: str):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.numero_twilio = os.getenv("TWILIO_PHONE_NUMBER")

        if not self.account_sid:
            raise Exception(
                "TWILIO_ACCOUNT_SID não foi configurado no .env"
            )

        if not self.auth_token:
            raise Exception(
                "TWILIO_AUTH_TOKEN não foi configurado no .env"
            )

        if not self.numero_twilio:
            raise Exception(
                "TWILIO_PHONE_NUMBER não foi configurado no .env"
            )

        if not telefone_destino:
            raise Exception(
                "O usuário não possui telefone cadastrado."
            )

        telefone = self.formatar_telefone(telefone_destino)

        mensagem = (
            f"PedidoManagerS: seu código de verificação é {codigo}. "
            "Esse código expira em 10 minutos."
        )

        client = Client(
            self.account_sid,
            self.auth_token
        )

        message = client.messages.create(
            body=mensagem,
            from_=self.numero_twilio,
            to=telefone
        )

        print(f"SMS enviado com sucesso. SID: {message.sid}")

    @staticmethod
    def formatar_telefone(telefone: str) -> str:
        telefone = str(telefone).strip()

        # Remove espaços, parênteses, hífens etc.
        telefone = "".join(
            caractere
            for caractere in telefone
            if caractere.isdigit() or caractere == "+"
        )

        # Se já estiver no formato internacional:
        # +5562999999999
        if telefone.startswith("+"):
            return telefone

        # Se vier como 5562999999999
        if telefone.startswith("55") and len(telefone) in (12, 13):
            return f"+{telefone}"

        # Número brasileiro sem código do país:
        # 62999999999
        if len(telefone) in (10, 11):
            return f"+55{telefone}"

        raise Exception(
            "Telefone inválido. Use um número brasileiro válido."
        )