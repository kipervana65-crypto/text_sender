import os
from dotenv import load_dotenv

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import smtplib

load_dotenv()

class EmailSender:
    def __init__(self):
        self.SMTP_SERVER = os.getenv("SMTP_SERVER")
        self.SMTP_PORT = int(os.getenv("SMTP_PORT"))
        self.SMTP_USER = os.getenv("SMTP_USER")
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

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