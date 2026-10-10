from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='USER') # GUEST, USER, ADMIN
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True) # Nullable for guests or linked later
    
    # Customer Info
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    
    # Event Info
    event_type = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    
    # Service & Package
    service = db.Column(db.String(100), nullable=False)
    package = db.Column(db.String(100), nullable=True)
    message = db.Column(db.Text, nullable=True)
    
    status = db.Column(db.String(20), default='PENDING') # PENDING, UNDER_REVIEW, CONFIRMED, REJECTED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False) # Wedding, Pre-Wedding, etc.
    location = db.Column(db.String(150), nullable=True)
    event_date = db.Column(db.String(50), nullable=True) # E.g., '2026'
    image_url = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    event_date = db.Column(db.String(50), nullable=True)
    event_location = db.Column(db.String(150), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='NEW') # NEW, READ, REPLIED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
