from app.extensions import db
from datetime import datetime

class Discount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    package_id = db.Column(db.Integer, db.ForeignKey('package.id'), nullable=True) # If null, applies to all packages
    discount_type = db.Column(db.String(50), default='percent') # 'percent' or 'fixed'
    value = db.Column(db.Float, nullable=False)
    active_from = db.Column(db.Date, nullable=True)
    active_to = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    package = db.relationship('Package', backref=db.backref('discounts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'package_id': self.package_id,
            'package_name': self.package.name if self.package else 'All Packages',
            'discount_type': self.discount_type,
            'value': self.value,
            'active_from': self.active_from.isoformat() if self.active_from else None,
            'active_to': self.active_to.isoformat() if self.active_to else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
