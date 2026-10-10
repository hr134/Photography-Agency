import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key_change_in_production")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt_secret_key_change_in_production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Mail settings
    MAIL_SERVER = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() in ["true", "on", "1"]
    MAIL_USE_SSL = os.environ.get("MAIL_USE_SSL", "false").lower() in ["true", "on", "1"]
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@velouracreations.com")
    
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///agency.db")

class ProductionConfig(Config):
    DEBUG = False
    _db_url = os.environ.get("DATABASE_URL", "sqlite:///agency.db")
    # Render provides postgres:// which SQLAlchemy 2.0 requires to be postgresql://
    if _db_url and _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url

config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}
