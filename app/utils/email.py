from threading import Thread
from flask import current_app
from flask_mail import Message
from app.extensions import mail

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")

def send_email(subject, sender, recipients, text_body, html_body=None):
    if not recipients:
        return
        
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    if html_body:
        msg.html = html_body
        
    app = current_app._get_current_object()
    Thread(target=send_async_email, args=(app, msg)).start()
