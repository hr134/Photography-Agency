from app.extensions import db

class BookingEvent(db.Model):
    """One row per event within a booking. Supports multiple events per booking."""
    __tablename__ = 'booking_event'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    sequence = db.Column(db.Integer, default=1)       # Event number: 1, 2, 3...
    event_type = db.Column(db.String(100), nullable=True)  # Wedding, Holud, etc.
    event_date = db.Column(db.Date, nullable=True)
    start_time = db.Column(db.String(20), nullable=True)   # e.g. "12:00"
    end_time = db.Column(db.String(20), nullable=True)     # e.g. "17:00"
    shift_label = db.Column(db.String(100), nullable=True) # e.g. "Day (12–5 PM)"
    venue = db.Column(db.String(300), nullable=True)
    location = db.Column(db.String(300), nullable=True)    # district/city
    notes = db.Column(db.Text, nullable=True)
    is_outdoor = db.Column(db.Boolean, default=False, nullable=True)

    # Per-event package override (nullable = falls back to booking.package_id)
    package_id = db.Column(db.Integer, db.ForeignKey('package.id'), nullable=True)

    # Optional guest count (stored but not shown in UI label)
    guest_count = db.Column(db.Integer, nullable=True)
    # Per-event team requirements
    team_requirements = db.Column(db.JSON, nullable=True)
    # Assigned Team Members for this event
    assigned_team_members = db.Column(db.JSON, nullable=True)  # List of TeamMember IDs or objects

    booking = db.relationship('Booking', back_populates='events')
    package = db.relationship('Package', foreign_keys=[package_id])

    def effective_package(self):
        """Return this event's package if set, else the booking's package."""
        if self.package:
            return self.package
        if self.booking and self.booking.package:
            return self.booking.package
        return None

    def to_dict(self):
        pkg = self.effective_package()
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'sequence': self.sequence,
            'event_type': self.event_type,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'shift_label': self.shift_label,
            'venue': self.venue,
            'location': self.location,
            'notes': self.notes,
            'package_id': self.package_id,
            'package_name': pkg.name if pkg else None,
            'package_price': pkg.price if pkg else None,
            'package_team_requirements': pkg.team_requirements if pkg else None,
            'team_requirements': self.team_requirements,
            'assigned_team_members': self.assigned_team_members or [],
            'guest_count': self.guest_count,
            'is_outdoor': self.is_outdoor,
        }
