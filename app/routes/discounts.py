from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.discount import Discount
from app.routes.admin import admin_required

from datetime import datetime

discounts_bp = Blueprint('discounts', __name__)

def parse_date(date_val):
    if not date_val:
        return None
    if isinstance(date_val, str):
        try:
            return datetime.fromisoformat(date_val.replace('Z', '+00:00')).date()
        except ValueError:
            return datetime.strptime(date_val[:10], '%Y-%m-%d').date()
    return date_val

@discounts_bp.route('', methods=['GET'])
def get_discounts():
    discounts = Discount.query.all()
    return jsonify({'discounts': [d.to_dict() for d in discounts]}), 200

@discounts_bp.route('/active', methods=['GET'])
def get_active_discounts():
    """Public endpoint: returns currently active discounts (date-range validated)."""
    import datetime
    today = datetime.date.today()
    discounts = Discount.query.filter_by(is_active=True).all()
    result = []
    for d in discounts:
        # Check date range if set
        if d.active_from and d.active_from > today:
            continue
        if d.active_to and d.active_to < today:
            continue
        result.append(d.to_dict())
    return jsonify({'discounts': result}), 200


@discounts_bp.route('', methods=['POST'])
@admin_required
def create_discount():
    data = request.json
    new_discount = Discount(
        package_id=data.get('package_id'),
        discount_type=data.get('discount_type', 'percent'),
        value=data.get('value', 0.0),
        active_from=parse_date(data.get('active_from')),
        active_to=parse_date(data.get('active_to')),
        is_active=data.get('is_active', True)
    )
    db.session.add(new_discount)
    db.session.commit()
    return jsonify(new_discount.to_dict()), 201

@discounts_bp.route('/<int:discount_id>', methods=['PUT'])
@admin_required
def update_discount(discount_id):
    discount = Discount.query.get_or_404(discount_id)
    data = request.json
    
    if 'package_id' in data: discount.package_id = data['package_id']
    if 'discount_type' in data: discount.discount_type = data['discount_type']
    if 'value' in data: discount.value = data['value']
    if 'active_from' in data: discount.active_from = parse_date(data['active_from'])
    if 'active_to' in data: discount.active_to = parse_date(data['active_to'])
    if 'is_active' in data: discount.is_active = data['is_active']

    db.session.commit()
    return jsonify(discount.to_dict()), 200

@discounts_bp.route('/<int:discount_id>', methods=['DELETE'])
@admin_required
def delete_discount(discount_id):
    discount = Discount.query.get_or_404(discount_id)
    db.session.delete(discount)
    db.session.commit()
    return jsonify({'message': 'Discount deleted'}), 200
