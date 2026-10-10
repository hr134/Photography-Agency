from app.extensions import db
from datetime import datetime

class Package(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    is_popular = db.Column(db.Boolean, default=False)
    features = db.Column(db.Text, nullable=True) # JSON or comma-separated string
    details = db.Column(db.Text, nullable=True)
    team_requirements = db.Column(db.JSON, nullable=True)
    default_discount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'is_popular': self.is_popular,
            'features': self.features,
            'details': self.details,
            'team_requirements': self.team_requirements,
            'default_discount': self.default_discount
        }
