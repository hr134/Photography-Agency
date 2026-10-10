from datetime import datetime
from app.extensions import db

class DevProject(db.Model):
    __tablename__ = 'dev_projects'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=False)
    thumbnail = db.Column(db.String(500), nullable=False)
    external_url = db.Column(db.String(500), nullable=False)
    technologies = db.Column(db.String(300), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    year = db.Column(db.String(20), nullable=True)
    display_order = db.Column(db.Integer, default=0)
    featured = db.Column(db.Boolean, default=False)
    published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug or '',
            'description': self.description,
            'thumbnail': self.thumbnail,
            'external_url': self.external_url,
            'technologies': self.technologies or '',
            'category': self.category or 'Web Development',
            'year': self.year or str(datetime.utcnow().year),
            'display_order': self.display_order,
            'featured': bool(self.featured),
            'published': bool(self.published),
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None,
            'updated_at': self.updated_at.isoformat() + 'Z' if self.updated_at else None
        }
