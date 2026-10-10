from app.extensions import db
from datetime import datetime
import json

class AgreementTerms(db.Model):
    """Versioned agreement terms. Each row is one version. Never delete."""
    __tablename__ = 'agreement_terms'

    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(20), nullable=False, unique=True)  # e.g. "v1.0"
    is_active = db.Column(db.Boolean, default=False)
    effective_from = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # All term sections stored as individual text fields for easy editing
    file_storage_policy = db.Column(db.Text, nullable=True)
    service_duration_policy = db.Column(db.Text, nullable=True)
    out_of_dhaka_policy = db.Column(db.Text, nullable=True)
    media_usage_policy = db.Column(db.Text, nullable=True)
    booking_advance_policy = db.Column(db.Text, nullable=True)
    cancellation_by_agency_policy = db.Column(db.Text, nullable=True)
    date_change_policy = db.Column(db.Text, nullable=True)
    unforeseen_situations_policy = db.Column(db.Text, nullable=True)
    technical_issues_policy = db.Column(db.Text, nullable=True)
    editing_changes_policy = db.Column(db.Text, nullable=True)
    delivery_timeline_policy = db.Column(db.Text, nullable=True)
    service_agreement_policy = db.Column(db.Text, nullable=True)
    client_acknowledgment_text = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'is_active': self.is_active,
            'effective_from': self.effective_from.isoformat() if self.effective_from else None,
            'file_storage_policy': self.file_storage_policy,
            'service_duration_policy': self.service_duration_policy,
            'out_of_dhaka_policy': self.out_of_dhaka_policy,
            'media_usage_policy': self.media_usage_policy,
            'booking_advance_policy': self.booking_advance_policy,
            'cancellation_by_agency_policy': self.cancellation_by_agency_policy,
            'date_change_policy': self.date_change_policy,
            'unforeseen_situations_policy': self.unforeseen_situations_policy,
            'technical_issues_policy': self.technical_issues_policy,
            'editing_changes_policy': self.editing_changes_policy,
            'delivery_timeline_policy': self.delivery_timeline_policy,
            'service_agreement_policy': self.service_agreement_policy,
            'client_acknowledgment_text': self.client_acknowledgment_text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def snapshot(self):
        """Return frozen snapshot for embedding in generated documents."""
        return self.to_dict()
