from flask import Blueprint

def register_blueprints(app):
    from .auth import auth_bp
    from .packages import packages_bp
    from .bookings import bookings_bp
    from .admin import admin_bp
    from .admin_docs import admin_docs_bp
    from .contact import contact_bp
    from .portfolio import portfolio_bp
    from .discounts import discounts_bp
    from .dev_projects import dev_projects_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(packages_bp, url_prefix='/api/packages')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_docs_bp, url_prefix='/api/admin')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    app.register_blueprint(discounts_bp, url_prefix='/api/admin/discounts')
    app.register_blueprint(dev_projects_bp, url_prefix='/api/dev-projects')

