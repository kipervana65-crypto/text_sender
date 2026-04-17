from .celery_conf import celery
from app.service.email_service import EmailSender

@celery.task
def send_code_email(email: str, code: str):
    email_sender=EmailSender()
    email_sender.send_email_code(to_email=email, code=code)

@celery.task
def send_notification_email(user_email: str, comment_id: int):
    self_email=EmailSender()
    self_email.send_notification(to_email=user_email, comment_id=comment_id)