from app.extensions import db
from datetime import datetime

class Document(db.Model):
    """Represents a generated PDF document (Agreement, Invoice, etc)."""
    __tablename__ = 'document'

    id = db.Column(db.Integer, primary_key=True)
    doc_number = db.Column(db.String(50), unique=True, nullable=False) # e.g. AGR-2026-000001
    doc_type = db.Column(db.String(50), nullable=False)                # AGREEMENT, INVOICE, PAYMENT_SLIP, RECEIPT
    version = db.Column(db.Integer, default=1)
    
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Snapshots - crucial for preserving historical data even if the real models change
    terms_version = db.Column(db.String(50), nullable=True) # e.g. "v1.0" - references AgreementTerms.version
    agency_snapshot = db.Column(db.JSON, nullable=True)     # frozen AgencySettings
    package_snapshot = db.Column(db.JSON, nullable=True)    # frozen Package details
    payment_snapshot = db.Column(db.JSON, nullable=True)    # frozen payment state at the time
    
    pdf_path = db.Column(db.String(512), nullable=True)
    is_finalized = db.Column(db.Boolean, default=False)
    
    generated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    booking = db.relationship('Booking', back_populates='documents')
    client = db.relationship('User', foreign_keys=[client_id])
    generator = db.relationship('User', foreign_keys=[generated_by])

    def to_dict(self):
        return {
            'id': self.id,
            'doc_number': self.doc_number,
            'doc_type': self.doc_type,
            'version': self.version,
            'booking_id': self.booking_id,
            'client_id': self.client_id,
            'terms_version': self.terms_version,
            'pdf_path': self.pdf_path,
            'is_finalized': self.is_finalized,
            'generated_by': self.generator.username if self.generator else None,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
        }
