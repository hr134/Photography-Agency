from flask_mail import Message
from app.extensions import mail
from flask import current_app
from threading import Thread

def _send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print(f"Successfully sent email to {msg.recipients} with subject: {msg.subject}")
        except Exception as e:
            print(f"Failed to send email to {msg.recipients}: {e}")

def send_email(to, subject, body, html_body=None):
    if not to:
        return False
        
    try:
        msg = Message(
            subject=subject,
            recipients=[to] if isinstance(to, str) else to,
            body=body,
            html=html_body
        )
        app = current_app._get_current_object()
        Thread(target=_send_async_email, args=(app, msg)).start()
        return True
    except Exception as e:
        print(f"Failed to queue email to {to}: {e}")
        return False
