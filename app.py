import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db

# Create the application instance using the factory
config_name = os.getenv("FLASK_CONFIG", "development")
app = create_app(config_name)

if __name__ == "__main__":
    with app.app_context():
        # Optionally create tables if they don't exist
        db.create_all()
    # Run on 0.0.0.0 to be reachable from Docker or external hosts
    app.run(host="0.0.0.0", port=5000, debug=config_name == "development")
