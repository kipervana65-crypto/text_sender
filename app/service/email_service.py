from ..core.config import get_settings
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import smtplib

settings=get_settings()

class EmailSender:
    def __init__(self):
        self.SMTP_SERVER = settings.SMTP_SERVER
        self.SMTP_PORT = settings.SMTP_PORT
        self.SMTP_USER = settings.SMTP_USER
        self.SMTP_PASSWORD = settings.SMTP_PASSWORD

    def send_email_code(self, to_email: str, code: str):
        subject = "Подтверждение email"
        body = f"Ваш код подтверждения: {code}"

        msg = MIMEMultipart()
        msg["From"] = self.SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(self.SMTP_SERVER, self.SMTP_PORT) as server:
            server.starttls()
            server.login(self.SMTP_USER, self.SMTP_PASSWORD)
            server.send_message(msg)