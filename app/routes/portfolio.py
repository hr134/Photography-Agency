import os
from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename
from app.models.portfolio import Story, Film
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

portfolio_bp = Blueprint('portfolio', __name__)

def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin

def save_file(file):
    if file and file.filename != '':
        filename = secure_filename(file.filename)
        # Create uploads directory if it doesn't exist
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        # Return public URL path
        return f"/static/uploads/{filename}"
    return None

# --- STORIES API ---

@portfolio_bp.route('/stories', methods=['GET'])
def get_stories():
    stories = Story.query.order_by(Story.created_at.desc()).all()
    return jsonify([s.to_dict() for s in stories]), 200

@portfolio_bp.route('/stories', methods=['POST'])
@jwt_required()
def create_story():
    if not is_admin(get_jwt_identity()):
        return jsonify({'message': 'Admin access required'}), 403

    couple = request.form.get('couple')
    category = request.form.get('category')
    location = request.form.get('location')
    year = request.form.get('year')
    external_link = request.form.get('external_link')
    
    file = request.files.get('image')
    image_url = save_file(file) if file else request.form.get('image_url')

    new_story = Story(
        couple=couple,
        category=category,
        location=location,
        year=year,
        image=image_url,
        external_link=external_link
    )
    
    try:
        db.session.add(new_story)
        db.session.commit()
        return jsonify({'message': 'Story created', 'story': new_story.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create story', 'error': str(e)}), 500

@portfolio_bp.route('/stories/<int:id>', methods=['PUT'])
@jwt_required()
def update_story(id):
    if not is_admin(get_jwt_identity()):
        return jsonify({'message': 'Admin access required'}), 403

    story = Story.query.get(id)
    if not story:
        return jsonify({'message': 'Story not found'}), 404

    story.couple = request.form.get('couple', story.couple)
    story.category = request.form.get('category', story.category)
    story.location = request.form.get('location', story.location)
    story.year = request.form.get('year', story.year)
    if request.form.get('external_link') is not None:
        story.external_link = request.form.get('external_link')
    
    file = request.files.get('image')
    if file and file.filename != '':
        image_url = save_file(file)
        if image_url:
            story.image = image_url
    else:
        provided_url = request.form.get('image_url')
        if provided_url:
            story.image = provided_url

    try:
        db.session.commit()
        return jsonify({'message': 'Story updated', 'story': story.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update story', 'error': str(e)}), 500

@portfolio_bp.route('/stories/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_story(id):
    if not is_admin(get_jwt_identity()):
        return jsonify({'message': 'Admin access required'}), 403

    story = Story.query.get(id)
    if not story:
        return jsonify({'message': 'Story not found'}), 404

    try:
        db.session.delete(story)
        db.session.commit()
        return jsonify({'message': 'Story deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete story'}), 500

# --- FILMS API ---

@portfolio_bp.route('/films', methods=['GET'])
def get_films():
    films = Film.query.order_by(Film.created_at.desc()).all()
    return jsonify([f.to_dict() for f in films]), 200

@portfolio_bp.route('/films', methods=['POST'])
@jwt_required()
def create_film():
    if not is_admin(get_jwt_identity()):
        return jsonify({'message': 'Admin access required'}), 403

    title = request.form.get('title')
    youtube_id = request.form.get('youtubeId')
    location = request.form.get('location')
    category = request.form.get('category')
    
    file = request.files.get('thumbnail')
    thumbnail_url = save_file(file) if file else request.form.get('thumbnail_url')

    new_film = Film(
        title=title,
        youtube_id=youtube_id,
        location=location,
        category=category,
        thumbnail=thumbnail_url
    )
    
    try:
        db.session.add(new_film)
        db.session.commit()
        return jsonify({'message': 'Film created', 'film': new_film.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create film', 'error': str(e)}), 500

@portfolio_bp.route('/films/<int:id>', methods=['PUT'])
@jwt_required()
def update_film(id):
    if not is_admin(get_jwt_identity()):
        return jsonify({'message': 'Admin access required'}), 403

    film = Film.query.get(id)
    if not film:
        return jsonify({'message': 'Film not found'}), 404

    film.title = request.form.get('title', film.title)
    film.youtube_id = request.form.get('youtubeId', film.youtube_id)
    film.location = request.form.get('location', film.location)
    film.category = request.form.get('category', film.category)
    
    file = request.files.get('thumbnail')
    if file and file.filename != '':
        thumbnail_url = save_file(file)
        if thumbnail_url:
            film.thumbnail = thumbnail_url
    else:
        provided_url = request.form.get('thumbnail_url')
        if provided_url:
            film.thumbnail = provided_url

    try:
        db.session.commit()
        return jsonify({'message': 'Film updated', 'film': film.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update film', 'error': str(e)}), 500

@portfolio_bp.route('/films/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_film(id):
    if not is_admin(get_jwt_identity()):
        return jsonify({'message': 'Admin access required'}), 403

    film = Film.query.get(id)
    if not film:
        return jsonify({'message': 'Film not found'}), 404

    try:
        db.session.delete(film)
        db.session.commit()
        return jsonify({'message': 'Film deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete film'}), 500
