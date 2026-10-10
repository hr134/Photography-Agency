from datetime import datetime
from app.extensions import db

class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    couple = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(20), nullable=False)
    image = db.Column(db.String(500), nullable=False)
    external_link = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'couple': self.couple,
            'category': self.category,
            'location': self.location,
            'year': self.year,
            'image': self.image,
            'external_link': self.external_link,
            'createdAt': self.created_at.isoformat() + 'Z' if self.created_at else None
        }

class Film(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    youtube_id = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    thumbnail = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'youtubeId': self.youtube_id,
            'location': self.location,
            'category': self.category,
            'thumbnail': self.thumbnail,
            'createdAt': self.created_at.isoformat() + 'Z' if self.created_at else None
        }
