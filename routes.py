from flask import Blueprint, request, jsonify
from models import db, User, Reservation, Portfolio, ContactMessage
from datetime import datetime

api = Blueprint('api', __name__)

# --- CONTACT API ---
@api.route('/contact', methods=['POST'])
def submit_contact():
    data = request.json
    if not data or not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({'error': 'Name, email, and message are required'}), 400
        
    msg = ContactMessage(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        event_date=data.get('eventDate'),
        event_location=data.get('eventLocation'),
        message=data['message']
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully!', 'id': msg.id}), 201

# --- RESERVATION API ---
@api.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.json
    required_fields = ['name', 'email', 'phone', 'event_type', 'event_date', 'location', 'service']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
            
    try:
        event_date_obj = datetime.strptime(data['event_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    res = Reservation(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        event_type=data['event_type'],
        event_date=event_date_obj,
        location=data['location'],
        service=data['service'],
        package=data.get('package'),
        message=data.get('message')
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({'message': 'Reservation submitted successfully!', 'reservation_id': res.id, 'status': res.status}), 201

@api.route('/reservations/<int:res_id>', methods=['GET'])
def get_reservation(res_id):
    res = Reservation.query.get_or_404(res_id)
    return jsonify({
        'id': res.id,
        'name': res.name,
        'event_date': res.event_date.strftime('%Y-%m-%d'),
        'location': res.location,
        'service': res.service,
        'package': res.package,
        'status': res.status
    })

# --- PORTFOLIO API ---
@api.route('/portfolio', methods=['GET'])
def get_portfolio():
    category = request.args.get('category')
    query = Portfolio.query
    if category and category.lower() != 'all stories':
        query = query.filter(Portfolio.category.ilike(f"%{category}%"))
    
    items = query.order_by(Portfolio.created_at.desc()).all()
    
    return jsonify([{
        'id': item.id,
        'title': item.title,
        'category': item.category,
        'location': item.location,
        'event_date': item.event_date,
        'image_url': item.image_url
    } for item in items])
