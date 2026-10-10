import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db

config_name = os.getenv("FLASK_CONFIG", "production")
app = create_app(config_name)

# Ensure database tables are created on startup
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        app.logger.warning(f"db.create_all warning: {e}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
