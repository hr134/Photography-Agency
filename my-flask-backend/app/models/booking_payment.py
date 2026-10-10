from app.extensions import db
from datetime import datetime

class BookingPayment(db.Model):
    """Tracks individual payment transactions for a booking."""
    __tablename__ = 'booking_payment'

    id = db.Column(db.Integer, primary_key=True)
    payment_number = db.Column(db.String(50), unique=True, nullable=False)  # RCT-2026-000001
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.String(50), nullable=True)    # Cash, bKash, Nagad, Bank Transfer, etc.
    transaction_id = db.Column(db.String(200), nullable=True)
    payment_date = db.Column(db.Date, nullable=True)
    recorded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship('Booking', back_populates='payments')
    recorder = db.relationship('User', foreign_keys=[recorded_by])

    def to_dict(self):
        return {
            'id': self.id,
            'payment_number': self.payment_number,
            'booking_id': self.booking_id,
            'amount': self.amount,
            'method': self.method,
            'transaction_id': self.transaction_id,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'recorded_by': self.recorder.username if self.recorder else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
