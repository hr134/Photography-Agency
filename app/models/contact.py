from datetime import datetime
from app.extensions import db

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    event_date = db.Column(db.String(100), nullable=True)
    event_location = db.Column(db.String(200), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='unread')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'eventDate': self.event_date,
            'eventLocation': self.event_location,
            'message': self.message,
            'status': self.status,
            'createdAt': self.created_at.isoformat() + 'Z' if self.created_at else None
        }
