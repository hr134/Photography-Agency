import os
from flask import Flask, send_from_directory, request
from .config import config_by_name
from .extensions import db, migrate, jwt, ma, cors

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Configure upload folder
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})
    
    from .extensions import mail
    mail.init_app(app)

    # Register Blueprints
    from .routes import register_blueprints
    register_blueprints(app)

    # Serve static uploads (PDFs, images etc.) publicly
    @app.route('/static/uploads/<path:filename>')
    def serve_upload(filename):
        upload_folder = app.config['UPLOAD_FOLDER']
        download = request.args.get('download')
        as_attachment = bool(download and str(download).lower() in ['1', 'true', 'yes'])
        return send_from_directory(upload_folder, filename, as_attachment=as_attachment)

    return app
