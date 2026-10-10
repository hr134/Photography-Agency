from app.extensions import db
from datetime import datetime
import json

class AgencySettings(db.Model):
    """Stores permanent agency information. Only one row should exist."""
    __tablename__ = 'agency_settings'

    id = db.Column(db.Integer, primary_key=True)
    agency_name = db.Column(db.String(200), default='Veloura Creations')
    tagline = db.Column(db.String(300), nullable=True)
    logo_url = db.Column(db.String(512), nullable=True)
    address = db.Column(db.Text, default='135/1 Gulshan Link Road, Dhaka 1100')
    phone = db.Column(db.String(50), default='+88 01673694261')
    email = db.Column(db.String(120), nullable=True)
    website = db.Column(db.String(200), default='www.velouracreations.com')
    facebook_url = db.Column(db.String(300), nullable=True)
    instagram_url = db.Column(db.String(300), nullable=True)
    other_social = db.Column(db.Text, nullable=True)  # JSON
    founder_name = db.Column(db.String(150), default='Najmul Ahmed')
    founder_designation = db.Column(db.String(200), default='Chief Photographer & Founder of Veloura Creations')
    default_currency = db.Column(db.String(10), default='BDT')
    default_country = db.Column(db.String(100), default='Bangladesh')
    extra_hour_rate = db.Column(db.Float, default=2000.0)
    drive_deletion_days = db.Column(db.Integer, default=7)
    storage_deletion_days = db.Column(db.Integer, default=30)
    free_revision_count = db.Column(db.Integer, default=1)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Allowed event types (JSON array)
    event_types = db.Column(db.Text, default='["Wedding","Holud","Reception","Engagement","Nikah","Pre-Wedding","Post-Wedding","Birthday","Corporate","Product Shoot","Other"]')

    # ─── Payment Method Details (admin-editable) ───────────────────────────────
    bkash_number = db.Column(db.String(30), nullable=True)
    nagad_number = db.Column(db.String(30), nullable=True)
    rocket_number = db.Column(db.String(30), nullable=True)
    bank_name = db.Column(db.String(150), nullable=True)
    bank_account_name = db.Column(db.String(200), nullable=True)
    bank_account_number = db.Column(db.String(100), nullable=True)
    bank_branch = db.Column(db.String(200), nullable=True)
    bank_routing = db.Column(db.String(50), nullable=True)

    bank2_name = db.Column(db.String(150), nullable=True)
    bank2_account_name = db.Column(db.String(200), nullable=True)
    bank2_account_number = db.Column(db.String(100), nullable=True)
    bank2_branch = db.Column(db.String(200), nullable=True)
    bank2_routing = db.Column(db.String(50), nullable=True)

    # ─── Email Notification Recipients ───────────────────────────────────────
    # JSON array of email addresses that receive booking notifications.
    # e.g. ["velouracreations@gmail.com", "manager@velouracreations.com"]
    notification_emails = db.Column(db.Text, default='["velouracreations@gmail.com"]')

    def to_dict(self):
        return {
            'id': self.id,
            'agency_name': self.agency_name,
            'tagline': self.tagline,
            'logo_url': self.logo_url,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'facebook_url': self.facebook_url,
            'instagram_url': self.instagram_url,
            'other_social': self.other_social,
            'founder_name': self.founder_name,
            'founder_designation': self.founder_designation,
            'default_currency': self.default_currency,
            'default_country': self.default_country,
            'extra_hour_rate': self.extra_hour_rate,
            'drive_deletion_days': self.drive_deletion_days,
            'storage_deletion_days': self.storage_deletion_days,
            'free_revision_count': self.free_revision_count,
            'event_types': json.loads(self.event_types) if self.event_types else [],
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Payment methods
            'bkash_number': self.bkash_number,
            'nagad_number': self.nagad_number,
            'rocket_number': self.rocket_number,
            'bank_name': self.bank_name,
            'bank_account_name': self.bank_account_name,
            'bank_account_number': self.bank_account_number,
            'bank_branch': self.bank_branch,
            'bank_routing': self.bank_routing,
            'bank2_name': self.bank2_name,
            'bank2_account_name': self.bank2_account_name,
            'bank2_account_number': self.bank2_account_number,
            'bank2_branch': self.bank2_branch,
            'bank2_routing': self.bank2_routing,
            'notification_emails': json.loads(self.notification_emails) if self.notification_emails else ['velouracreations@gmail.com'],
        }

    def payment_info(self):
        """Return only payment method details (safe for public/client exposure)."""
        return {
            'bkash_number': self.bkash_number,
            'nagad_number': self.nagad_number,
            'rocket_number': self.rocket_number,
            'bank_name': self.bank_name,
            'bank_account_name': self.bank_account_name,
            'bank_account_number': self.bank_account_number,
            'bank_branch': self.bank_branch,
            'bank_routing': self.bank_routing,
            'bank2_name': self.bank2_name,
            'bank2_account_name': self.bank2_account_name,
            'bank2_account_number': self.bank2_account_number,
            'bank2_branch': self.bank2_branch,
            'bank2_routing': self.bank2_routing,
        }

    def snapshot(self):
        """Return a frozen dict snapshot for embedding in documents."""
        return {
            'agency_name': self.agency_name,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'founder_name': self.founder_name,
            'founder_designation': self.founder_designation,
            'logo_url': self.logo_url,
            'extra_hour_rate': self.extra_hour_rate,
        }
