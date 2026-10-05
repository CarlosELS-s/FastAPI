import os
import requests

from twilio.rest import Client


class Enviar_Email:

    def __init__(self, email_destino: str, codigo: int):
        self.remetente = os.getenv("EMAIL_REMETENTE")
        self.resend_api_key = os.getenv("RESEND_API_KEY")

        if not self.remetente:
            raise Exception(
                "EMAIL_REMETENTE não foi configurado no Render."
            )

        if not self.resend_api_key:
            raise Exception(
                "RESEND_API_KEY não foi configurada no Render."
            )

        if not email_destino:
            raise Exception(
                "O usuário não possui e-mail cadastrado."
            )

        mensagem = {
            "from": self.remetente,
            "to": [email_destino],
            "subject": "Código de verificação - PedidoManager",
            "text": f"""
Olá!

Seu código de verificação é:

{codigo}

Esse código expira em 10 minutos.

PedidoManager
""",
        }

        try:
            resposta = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {self.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json=mensagem,
                timeout=15,
            )

        except requests.RequestException as e:
            raise Exception(
                f"Não foi possível conectar ao serviço de e-mail: {e}"
            )

        if not resposta.ok:
            try:
                erro = resposta.json()
            except Exception:
                erro = resposta.text

            raise Exception(
                f"Erro ao enviar e-mail: {erro}"
            )

        print(f"E-mail enviado com sucesso para {email_destino}.")


class Enviar_SMS:

    def __init__(self, telefone_destino: str, codigo: str):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.numero_twilio = os.getenv("TWILIO_PHONE_NUMBER")

        if not self.account_sid:
            raise Exception(
                "TWILIO_ACCOUNT_SID não foi configurado no Render."
            )

        if not self.auth_token:
            raise Exception(
                "TWILIO_AUTH_TOKEN não foi configurado no Render."
            )

        if not self.numero_twilio:
            raise Exception(
                "TWILIO_PHONE_NUMBER não foi configurado no Render."
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

        print(
            f"SMS enviado com sucesso. SID: {message.sid}"
        )

    @staticmethod
    def formatar_telefone(telefone: str) -> str:
        telefone = str(telefone).strip()

        telefone = "".join(
            caractere
            for caractere in telefone
            if caractere.isdigit() or caractere == "+"
        )

        if telefone.startswith("+"):
            return telefone

        if telefone.startswith("55") and len(telefone) in (12, 13):
            return f"+{telefone}"

        if len(telefone) in (10, 11):
            return f"+55{telefone}"

        raise Exception(
            "Telefone inválido. Use um número brasileiro válido."
        )