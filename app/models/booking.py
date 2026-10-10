from app.extensions import db
from datetime import datetime

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    package_id = db.Column(db.Integer, db.ForeignKey('package.id'), nullable=False)
    event_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), default='PENDING') # PENDING, CONFIRMED, COMPLETED, CANCELLED
    total_amount = db.Column(db.Float, nullable=False)
    advance_paid = db.Column(db.Float, default=0.0)

    # New fields for workflow and booking details
    workflow_status = db.Column(db.String(100), default='Pending')
    delivery_link = db.Column(db.String(500), nullable=True)
    delivery_status = db.Column(db.String(100), default='Not Started')  # Not Started, Processing, Ready, Delivered
    venue = db.Column(db.String(200), nullable=True)
    event_details = db.Column(db.Text, nullable=True)
    contact_info = db.Column(db.String(200), nullable=True)
    agreement_text = db.Column(db.Text, nullable=True)
    agreement_status = db.Column(db.String(50), default='Pending') # Pending, Confirmed
    is_read = db.Column(db.Boolean, default=False) # Whether admin has viewed this booking

    # New custom fields
    district = db.Column(db.String(100), nullable=True)
    extra_hours = db.Column(db.Integer, default=0)
    team_requirements = db.Column(db.JSON, nullable=True)

    # Agency System phase 2 fields
    booking_number = db.Column(db.String(50), unique=True, nullable=True) # e.g. BK-2026-000001
    discount = db.Column(db.Float, default=0.0)
    final_amount = db.Column(db.Float, nullable=True)
    payment_status = db.Column(db.String(50), default='UNPAID') # UNPAID, PARTIAL, PAID, OVERDUE
    media_consent = db.Column(db.String(50), default='PENDING') # GRANTED, NOT_GRANTED, CUSTOM, PENDING
    groom_name = db.Column(db.String(150), nullable=True)
    bride_name = db.Column(db.String(150), nullable=True)

    # ─── Booking Client Details (the person who books, separate from bride/groom) ─
    client_name = db.Column(db.String(200), nullable=True)     # Full name of booking client
    client_phone = db.Column(db.String(30), nullable=True)     # WhatsApp / primary phone
    client_address = db.Column(db.Text, nullable=True)         # Full address

    # ─── Payment submission from client at booking time ───────────────────────
    payment_method = db.Column(db.String(50), nullable=True)           # bKash, Nagad, Bank, Cash, etc.
    payment_transaction_id = db.Column(db.String(200), nullable=True)  # TXN ID / sent mobile / bank ref
    payment_notes = db.Column(db.Text, nullable=True)                  # Any Other Instruction for payment

    # ─── Custom Deliverables for Agreement ───────────────────────
    deliverables = db.Column(db.Text, nullable=True)

    # ─── Assigned Team Members for this Booking ──────────────────
    assigned_team_members = db.Column(db.JSON, nullable=True)  # List of TeamMember IDs

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('bookings', lazy=True))
    package = db.relationship('Package', backref=db.backref('bookings', lazy=True))

    events = db.relationship('BookingEvent', back_populates='booking', cascade='all, delete-orphan')
    payments = db.relationship('BookingPayment', back_populates='booking', cascade='all, delete-orphan')
    documents = db.relationship('Document', back_populates='booking', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'package_id': self.package_id,
            'package_name': self.package.name if self.package else None,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'advance_paid': self.advance_paid,
            'workflow_status': self.workflow_status,
            'delivery_link': self.delivery_link,
            'delivery_status': self.delivery_status,
            'venue': self.venue,
            'event_details': self.event_details,
            'contact_info': self.contact_info,
            'agreement_text': self.agreement_text,
            'agreement_status': self.agreement_status,
            'district': self.district,
            'extra_hours': self.extra_hours,
            'team_requirements': self.team_requirements,
            'booking_number': self.booking_number,
            'discount': self.discount,
            'final_amount': self.final_amount,
            'payment_status': self.payment_status,
            'media_consent': self.media_consent,
            'groom_name': self.groom_name,
            'bride_name': self.bride_name,
            # Booking client details
            'client_name': self.client_name,
            'client_phone': self.client_phone,
            'client_address': self.client_address,
            # Payment submission
            'payment_method': self.payment_method,
            'payment_transaction_id': self.payment_transaction_id,
            'payment_notes': self.payment_notes,
            'deliverables': self.deliverables,
            'is_read': self.is_read,
            'assigned_team_members': self.assigned_team_members or [],
            'due_amount': (self.final_amount or self.total_amount or 0) - (self.advance_paid or 0),
            'events': [e.to_dict() for e in self.events] if self.events else [],
            'documents': [d.to_dict() for d in self.documents] if self.documents else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
