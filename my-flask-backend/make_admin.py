import sys
import os
from app import create_app
from app.extensions import db
from app.models import User

if len(sys.argv) < 2:
    print("Usage: python make_admin.py <email>")
    sys.exit(1)

email = sys.argv[1]
app = create_app(os.getenv("FLASK_CONFIG", "development"))

with app.app_context():
    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"User with email {email} not found.")
        sys.exit(1)
    
    user.is_admin = True
    db.session.commit()
    print(f"User {email} has been elevated to Admin.")
