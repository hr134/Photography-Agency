from flask_mail import Message
from app.extensions import mail
from flask import current_app
from threading import Thread

def _send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print(f"[Email] Successfully sent email to {msg.recipients} with subject: {msg.subject}", flush=True)
        except Exception as e:
            print(f"[Email Error] Failed to send email to {msg.recipients}: {e}", flush=True)

def send_email(to, subject, body, html_body=None):
    if not to:
        return False
        
    try:
        sender = current_app.config.get("MAIL_DEFAULT_SENDER", "Veloura Creations <velouracreations@gmail.com>")
        msg = Message(
            subject=subject,
            recipients=[to] if isinstance(to, str) else to,
            body=body,
            html=html_body,
            sender=sender
        )
        app = current_app._get_current_object()
        Thread(target=_send_async_email, args=(app, msg)).start()
        return True
    except Exception as e:
        print(f"[Email Error] Failed to queue email to {to}: {e}", flush=True)
        return False
