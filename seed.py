from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.extensions import db
from app.models import Package, User
from app.utils.security import hash_password
import os

app = create_app(os.getenv("FLASK_CONFIG", "development"))

# Emails that are automatically granted admin on Google sign-in
ADMIN_EMAILS = [
    "hr1349891@gmail.com",
    "velouracreations@gmail.com",
]

with app.app_context():
    # Create all tables (won't affect existing ones, will create new ones)
    db.create_all()

    # ── Seed default admin user ──────────────────────────────────────────────
    existing_admin = User.query.filter_by(username="admin").first()
    if not existing_admin:
        print("Creating default admin user...")
        admin_user = User(
            username="admin",
            email="admin@velouracreations.com",
            password_hash=hash_password("najistheadmin1102026"),
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created (username: admin / password: najistheadmin1102026)")
    else:
        # Update password for existing admin and ensure is_admin = True
        existing_admin.password_hash = hash_password("najistheadmin1102026")
        if not existing_admin.is_admin:
            existing_admin.is_admin = True
        db.session.commit()
        print("Admin user already exists. Password updated to najistheadmin1102026.")

    # ── Elevate Google admin emails if they already exist ───────────────────
    for email in ADMIN_EMAILS:
        user = User.query.filter_by(email=email).first()
        if user and not user.is_admin:
            user.is_admin = True
            db.session.commit()
            print(f"Elevated {email} to admin.")

    # ── Seed packages ────────────────────────────────────────────────────────
    if Package.query.count() == 0:
        print("Seeding initial packages...")
        essential = Package(
            name="Wedding Photography",
            description="✓ 1 Photographer\n✓ 6 Hours Coverage\n✓ Edited Images (500+)\n✓ Online Gallery",
            price=75000,
            is_popular=False
        )
        signature = Package(
            name="Photography + Cinematography",
            description="✓ 2 Photographers\n✓ Full Day Coverage\n✓ Highlight Film (3-5 min)\n✓ Full Wedding Film\n✓ Premium Album",
            price=125000,
            is_popular=True
        )
        bespoke = Package(
            name="Custom Package",
            description="✓ Multiple Photographers\n✓ Cinematic Films\n✓ Custom Album\n✓ Drone (optional)\n✓ Add-ons Available",
            price=200000,
            is_popular=False
        )
        db.session.add_all([essential, signature, bespoke])
        db.session.commit()
        print("Packages seeded successfully!")
    else:
        print("Packages already exist.")
