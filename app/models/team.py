from app.extensions import db
from datetime import datetime

class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Optional linking to an actual app user account
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False) # e.g. Photographer, Cinematographer
    phone = db.Column(db.String(20), nullable=True)
    
    # New custom fields requested by user
    fb_id = db.Column(db.String(200), nullable=True)
    whatsapp_number = db.Column(db.String(20), nullable=True)
    body_model = db.Column(db.String(100), nullable=True)
    lens = db.Column(db.String(100), nullable=True)
    gimbal_or_softbox = db.Column(db.String(100), nullable=True)
    light_setup = db.Column(db.String(100), nullable=True)
    living_area = db.Column(db.String(200), nullable=True)
    payment = db.Column(db.String(100), nullable=True)
    works_experience = db.Column(db.String(200), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('team_profile', uselist=False, lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'role': self.role,
            'phone': self.phone,
            'fb_id': self.fb_id,
            'whatsapp_number': self.whatsapp_number,
            'body_model': self.body_model,
            'lens': self.lens,
            'gimbal_or_softbox': self.gimbal_or_softbox,
            'light_setup': self.light_setup,
            'living_area': self.living_area,
            'payment': self.payment,
            'works_experience': self.works_experience
        }
