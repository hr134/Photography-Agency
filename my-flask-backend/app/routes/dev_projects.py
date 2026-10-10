import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.dev_project import DevProject
from app.models.user import User
from app.extensions import db

dev_projects_bp = Blueprint('dev_projects', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'pdf', 'avif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_admin(user_id):
    try:
        user = User.query.get(int(user_id))
        return bool(user and user.is_admin)
    except Exception:
        return False

def save_uploaded_file(file):
    if not file or file.filename == '':
        return None
    if not allowed_file(file.filename):
        return None
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"dev_{uuid.uuid4().hex[:10]}.{ext}"
    safe_name = secure_filename(unique_name)
    
    upload_folder = current_app.config.get('UPLOAD_FOLDER', os.path.join(current_app.root_path, 'static', 'uploads'))
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, safe_name)
    file.save(file_path)
    return f"/static/uploads/{safe_name}"

# ── PUBLIC ENDPOINTS ──────────────────────────────────────────────────────────

@dev_projects_bp.route('', methods=['GET'])
def get_public_projects():
    """Returns all published projects for the public landing page."""
    try:
        projects = DevProject.query.filter_by(published=True).order_by(
            DevProject.display_order.asc(),
            DevProject.id.asc()
        ).all()
        return jsonify([p.to_dict() for p in projects]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch projects', 'error': str(e)}), 500

# ── ADMIN ENDPOINTS ───────────────────────────────────────────────────────────

@dev_projects_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_projects_admin():
    """Returns all projects (including drafts) for the admin dashboard."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403
    
    try:
        projects = DevProject.query.order_by(
            DevProject.display_order.asc(),
            DevProject.id.asc()
        ).all()
        return jsonify([p.to_dict() for p in projects]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch projects', 'error': str(e)}), 500

@dev_projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new developer project."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    # Check if request is multipart form data or json
    if request.is_json:
        data = request.get_json() or {}
        title = data.get('title')
        description = data.get('description')
        external_url = data.get('external_url')
        thumbnail = data.get('thumbnail')
        technologies = data.get('technologies', '')
        category = data.get('category', 'Web Development')
        year = data.get('year', '')
        display_order = data.get('display_order', 0)
        featured = data.get('featured', False)
        published = data.get('published', True)
    else:
        title = request.form.get('title')
        description = request.form.get('description')
        external_url = request.form.get('external_url')
        thumbnail = request.form.get('thumbnail')
        technologies = request.form.get('technologies', '')
        category = request.form.get('category', 'Web Development')
        year = request.form.get('year', '')
        display_order = int(request.form.get('display_order', 0) or 0)
        featured = request.form.get('featured') in ['true', 'True', '1', True]
        published = request.form.get('published') in ['true', 'True', '1', True]

        file = request.files.get('thumbnail_file') or request.files.get('thumbnail')
        if file and file.filename != '':
            saved_url = save_uploaded_file(file)
            if saved_url:
                thumbnail = saved_url

    if not title or not description or not external_url:
        return jsonify({'message': 'Title, description, and external_url are required'}), 400

    if not thumbnail:
        # Provide default clean fallback mockup thumbnail
        thumbnail = '/project_mockup_preview.jpg'

    # Auto slug
    slug = title.lower().strip().replace(' ', '-').replace('/', '-')

    new_project = DevProject(
        title=title.strip(),
        slug=slug,
        description=description.strip(),
        thumbnail=thumbnail.strip(),
        external_url=external_url.strip(),
        technologies=technologies.strip() if technologies else '',
        category=category.strip() if category else 'Web Development',
        year=str(year).strip() if year else '',
        display_order=int(display_order or 0),
        featured=bool(featured),
        published=bool(published)
    )

    try:
        db.session.add(new_project)
        db.session.commit()
        return jsonify({'message': 'Project created successfully', 'project': new_project.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create project', 'error': str(e)}), 500

@dev_projects_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_project(id):
    """Update an existing developer project."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    project = DevProject.query.get(id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    if request.is_json:
        data = request.get_json() or {}
        if 'title' in data:
            project.title = data['title'].strip()
            project.slug = data['title'].lower().strip().replace(' ', '-').replace('/', '-')
        if 'description' in data:
            project.description = data['description'].strip()
        if 'external_url' in data:
            project.external_url = data['external_url'].strip()
        if 'thumbnail' in data and data['thumbnail']:
            project.thumbnail = data['thumbnail'].strip()
        if 'technologies' in data:
            project.technologies = data['technologies'].strip()
        if 'category' in data:
            project.category = data['category'].strip()
        if 'year' in data:
            project.year = str(data['year']).strip()
        if 'display_order' in data:
            project.display_order = int(data['display_order'])
        if 'featured' in data:
            project.featured = bool(data['featured'])
        if 'published' in data:
            project.published = bool(data['published'])
    else:
        if request.form.get('title'):
            project.title = request.form.get('title').strip()
            project.slug = project.title.lower().strip().replace(' ', '-').replace('/', '-')
        if request.form.get('description'):
            project.description = request.form.get('description').strip()
        if request.form.get('external_url'):
            project.external_url = request.form.get('external_url').strip()
        if request.form.get('thumbnail'):
            project.thumbnail = request.form.get('thumbnail').strip()
        if request.form.get('technologies') is not None:
            project.technologies = request.form.get('technologies').strip()
        if request.form.get('category'):
            project.category = request.form.get('category').strip()
        if request.form.get('year'):
            project.year = str(request.form.get('year')).strip()
        if request.form.get('display_order') is not None:
            project.display_order = int(request.form.get('display_order') or 0)
        if request.form.get('featured') is not None:
            project.featured = request.form.get('featured') in ['true', 'True', '1', True]
        if request.form.get('published') is not None:
            project.published = request.form.get('published') in ['true', 'True', '1', True]

        file = request.files.get('thumbnail_file') or request.files.get('thumbnail')
        if file and file.filename != '':
            saved_url = save_uploaded_file(file)
            if saved_url:
                project.thumbnail = saved_url

    try:
        db.session.commit()
        return jsonify({'message': 'Project updated successfully', 'project': project.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update project', 'error': str(e)}), 500

@dev_projects_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_project(id):
    """Delete a project."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    project = DevProject.query.get(id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    try:
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Project deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete project', 'error': str(e)}), 500

@dev_projects_bp.route('/<int:id>/toggle-publish', methods=['PATCH'])
@jwt_required()
def toggle_publish(id):
    """Quick toggle publish state."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    project = DevProject.query.get(id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    try:
        project.published = not project.published
        db.session.commit()
        return jsonify({
            'message': f"Project {'published' if project.published else 'unpublished'}",
            'project': project.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to toggle publish status', 'error': str(e)}), 500

@dev_projects_bp.route('/reorder', methods=['POST'])
@jwt_required()
def reorder_projects():
    """Batch update display order."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json() or {}
    items = data.get('orders', []) # list of { id: 1, display_order: 0 }
    
    try:
        for item in items:
            pid = item.get('id')
            order = item.get('display_order')
            if pid is not None and order is not None:
                p = DevProject.query.get(pid)
                if p:
                    p.display_order = int(order)
        db.session.commit()
        return jsonify({'message': 'Projects reordered successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to reorder projects', 'error': str(e)}), 500

# ── GENERAL FILE UPLOAD (PDF, IMAGES) ─────────────────────────────────────────

@dev_projects_bp.route('/upload-file', methods=['POST'])
@jwt_required()
def upload_general_file():
    """Upload any allowed file (images, PDFs) and return public static URL."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    file = request.files.get('file') or request.files.get('pdf') or request.files.get('image')
    if not file or file.filename == '':
        return jsonify({'message': 'No file uploaded'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({'message': f'File type .{ext} is not allowed'}), 400

    unique_name = f"dev_{uuid.uuid4().hex[:10]}.{ext}"
    safe_name = secure_filename(unique_name)

    upload_folder = current_app.config.get('UPLOAD_FOLDER', os.path.join(current_app.root_path, 'static', 'uploads'))
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, safe_name)
    file.save(file_path)

    file_size_bytes = os.path.getsize(file_path)
    file_size_str = f"{round(file_size_bytes / 1024, 1)} KB" if file_size_bytes < 1024 * 1024 else f"{round(file_size_bytes / (1024 * 1024), 2)} MB"

    return jsonify({
        'url': f"/static/uploads/{safe_name}",
        'filename': file.filename,
        'size': file_size_str,
        'ext': ext
    }), 200

# ── CONTACT INFO & CV PERSISTENCE HELPER ───────────────────────────────────────

import json

def get_settings_file_path():
    settings_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(settings_dir, exist_ok=True)
    return os.path.join(settings_dir, 'portfolio_data.json')

def load_portfolio_data():
    path = get_settings_file_path()
    default_data = {
        'contact': {
            'email': 'hr1349891@gmail.com',
            'phone': '+880 1700 000000',
            'whatsapp': '+880 1700 000000',
            'location': 'Dhaka, Bangladesh',
            'available': True,
            'avatar_url': '/harun_avatar.jpg',
            'tagline': 'Software & Systems Engineer available for architecture, engineering development, and technical collaboration.',
            'socials': [
                {'id': '1', 'platform': 'LinkedIn', 'label': 'LinkedIn', 'url': 'https://linkedin.com', 'icon': 'linkedin'},
                {'id': '2', 'platform': 'GitHub', 'label': 'GitHub', 'url': 'https://github.com', 'icon': 'github'},
                {'id': '3', 'platform': 'Email', 'label': 'hr1349891@gmail.com', 'url': 'mailto:hr1349891@gmail.com', 'icon': 'mail'},
            ],
            'custom_contacts': [
                {'id': 'c1', 'label': 'Role', 'value': 'Software & Systems Engineer', 'link': ''},
                {'id': 'c2', 'label': 'Expertise', 'value': 'Full-Stack Architecture', 'link': ''},
            ]
        },
        'cvs': [
            {
                'id': 'cv-default',
                'title': 'Engineering Resume (Comprehensive)',
                'subtitle': 'Full engineering profile, systems architecture & technical accomplishments',
                'file_url': '/static/uploads/documents/sample_cv.pdf',
                'filename': 'Harun_Rashid_Engineering_Resume.pdf',
                'file_size': '240 KB',
                'uploaded_at': '2026',
                'is_primary': True,
                'published': True
            }
        ]
    }
    if not os.path.exists(path):
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(default_data, f, indent=2)
        except Exception:
            pass
        return default_data

    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default_data

def save_portfolio_data(data):
    path = get_settings_file_path()
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

# ── CONTACT INFO ENDPOINTS ────────────────────────────────────────────────────

@dev_projects_bp.route('/contact-info', methods=['GET'])
def get_contact_info():
    """Public endpoint to fetch portfolio contact settings."""
    data = load_portfolio_data()
    return jsonify(data.get('contact', {})), 200

@dev_projects_bp.route('/contact-info', methods=['PUT'])
@jwt_required()
def update_contact_info():
    """Admin endpoint to update portfolio contact settings."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    payload = request.get_json() or {}
    data = load_portfolio_data()
    data['contact'] = payload
    try:
        save_portfolio_data(data)
        return jsonify({'message': 'Contact information updated', 'contact': data['contact']}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to save contact info', 'error': str(e)}), 500

# ── CV / RESUME ENDPOINTS ─────────────────────────────────────────────────────

@dev_projects_bp.route('/cvs', methods=['GET'])
def get_cvs():
    """Public endpoint to fetch published CVs."""
    data = load_portfolio_data()
    cvs = data.get('cvs', [])
    return jsonify(cvs), 200

@dev_projects_bp.route('/cvs', methods=['POST'])
@jwt_required()
def add_or_update_cv():
    """Admin endpoint to add or edit a CV."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    payload = request.get_json() or {}
    cv_id = payload.get('id') or f"cv_{uuid.uuid4().hex[:8]}"
    title = payload.get('title', 'BSc Engineering CV')
    file_url = payload.get('file_url')
    
    if not file_url:
        return jsonify({'message': 'File URL is required'}), 400

    data = load_portfolio_data()
    cvs = data.get('cvs', [])

    new_cv = {
        'id': cv_id,
        'title': title,
        'subtitle': payload.get('subtitle', ''),
        'file_url': file_url,
        'filename': payload.get('filename', 'CV.pdf'),
        'file_size': payload.get('file_size', ''),
        'uploaded_at': payload.get('uploaded_at', '2026'),
        'is_primary': bool(payload.get('is_primary', False)),
        'published': bool(payload.get('published', True))
    }

    # If new_cv is primary, unset other primaries
    if new_cv['is_primary']:
        for item in cvs:
            item['is_primary'] = False

    # Check if exists, update or append
    existing_idx = next((i for i, c in enumerate(cvs) if c['id'] == cv_id), None)
    if existing_idx is not None:
        cvs[existing_idx] = new_cv
    else:
        cvs.append(new_cv)

    data['cvs'] = cvs
    save_portfolio_data(data)
    return jsonify({'message': 'CV saved successfully', 'cv': new_cv, 'cvs': cvs}), 200

@dev_projects_bp.route('/cvs/<cv_id>', methods=['DELETE'])
@jwt_required()
def delete_cv(cv_id):
    """Admin endpoint to delete a CV."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    data = load_portfolio_data()
    cvs = [c for c in data.get('cvs', []) if c['id'] != cv_id]
    data['cvs'] = cvs
    save_portfolio_data(data)
    return jsonify({'message': 'CV deleted successfully', 'cvs': cvs}), 200

@dev_projects_bp.route('/cvs/<cv_id>/toggle-primary', methods=['PATCH'])
@jwt_required()
def toggle_primary_cv(cv_id):
    """Admin endpoint to set primary CV."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    data = load_portfolio_data()
    cvs = data.get('cvs', [])
    for c in cvs:
        c['is_primary'] = (c['id'] == cv_id)
    data['cvs'] = cvs
    save_portfolio_data(data)
    return jsonify({'message': 'Primary CV updated', 'cvs': cvs}), 200

# ── ABOUT ME ENDPOINTS ────────────────────────────────────────────────────────

DEFAULT_ABOUT_DATA = {
    'headline': "HI, I'M HARUN",
    'subheadline': 'SOFTWARE & SYSTEMS ENGINEER',
    'avatar_badge': 'SOFT. ENGINEER',
    'bio_short': 'Engineer focused on architecting resilient software systems, scalable backends, and modern computational platforms with high technical precision.',
    'bio_long': 'I am an engineer dedicated to designing robust software systems, computational workflows, and scalable architectures. With a disciplined engineering background, I bridge foundational engineering principles with modern full-stack technologies to deliver software that is reliable, secure, and built for scale.',
    'available': True,
    'pillar1_title': 'ENGINEERING ARCHITECTURE',
    'pillar1_desc': 'Applying core computer science & software engineering principles to design resilient, fault-tolerant platforms.',
    'pillar2_title': 'SYSTEMS & SCALE',
    'pillar2_desc': 'Designing clean relational schemas, secure auth flows, and resilient API endpoints engineered for production reliability.',
    'pillar3_title': 'MOTION & INTERACTIVE UX',
    'pillar3_desc': 'Crafting fluid GPU micro-animations, accessible interfaces, and refined interactions inspired by editorial design.',
}

@dev_projects_bp.route('/about', methods=['GET'])
def get_about_content():
    """Public endpoint to fetch portfolio about content."""
    data = load_portfolio_data()
    about = data.get('about', DEFAULT_ABOUT_DATA)
    return jsonify(about), 200

@dev_projects_bp.route('/about', methods=['PUT'])
@jwt_required()
def update_about_content():
    """Admin endpoint to update portfolio about content."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    payload = request.get_json() or {}
    data = load_portfolio_data()
    data['about'] = payload
    try:
        save_portfolio_data(data)
        return jsonify({'message': 'About content updated successfully', 'about': data['about']}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to save about content', 'error': str(e)}), 500

# ── SERVICES ENDPOINTS ────────────────────────────────────────────────────────

DEFAULT_SERVICES_DATA = [
    {
        'number': '01',
        'title': 'FULL-STACK SYSTEMS ENGINEERING',
        'description': 'End-to-end responsive web applications built with Next.js, React, TypeScript, and modern ecosystem tooling.',
        'tags': 'Next.js, React, TypeScript, Tailwind CSS'
    },
    {
        'number': '02',
        'title': 'SOFTWARE ARCHITECTURE & API DESIGN',
        'description': 'Robust RESTful API design, authentication systems, and service layers with Python and Flask.',
        'tags': 'Python, Flask, REST APIs, JWT Security'
    },
    {
        'number': '03',
        'title': 'DATABASE & DATA MODELING',
        'description': 'Relational schema design, migrations, efficient queries, and data integrity using PostgreSQL and SQLAlchemy.',
        'tags': 'PostgreSQL, SQLite, SQLAlchemy, Alembic'
    },
    {
        'number': '04',
        'title': 'INTERACTIVE UI & 3D MOTION UX',
        'description': 'Editorial-grade typography, 3D scroll-driven mechanics, and smooth GPU-accelerated micro-interactions.',
        'tags': 'Framer Motion, 3D Perspective, Responsive UI'
    }
]

@dev_projects_bp.route('/services', methods=['GET'])
def get_services_content():
    """Public endpoint to fetch portfolio services."""
    data = load_portfolio_data()
    services = data.get('services', DEFAULT_SERVICES_DATA)
    return jsonify(services), 200

@dev_projects_bp.route('/services', methods=['PUT'])
@jwt_required()
def update_services_content():
    """Admin endpoint to update portfolio services."""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({'message': 'Admin access required'}), 403

    payload = request.get_json() or []
    data = load_portfolio_data()
    data['services'] = payload
    try:
        save_portfolio_data(data)
        return jsonify({'message': 'Services updated successfully', 'services': data['services']}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to save services', 'error': str(e)}), 500


