from flask import Blueprint, jsonify, request
from app.extensions import db
from app.routes.admin import admin_required
from app.models.agency_settings import AgencySettings
from app.models.agreement_terms import AgreementTerms
from app.models.booking import Booking
from app.models.booking_payment import BookingPayment
from app.models.document import Document
import datetime

admin_docs_bp = Blueprint('admin_docs', __name__)

# ─── Agency Settings ─────────────────────────────────────────────────────────

@admin_docs_bp.route('/agency-settings', methods=['GET'])
@admin_required
def get_agency_settings():
    settings = AgencySettings.query.first()
    if not settings:
        # Return empty/default if not found
        return jsonify({}), 200
    return jsonify(settings.to_dict()), 200

@admin_docs_bp.route('/agency-settings/public', methods=['GET'])
def get_agency_settings_public():
    settings = AgencySettings.query.first()
    if not settings:
        return jsonify({}), 200
    return jsonify(settings.to_dict()), 200


@admin_docs_bp.route('/agency-settings', methods=['PUT'])
@admin_required
def update_agency_settings():
    data = request.get_json()
    settings = AgencySettings.query.first()
    
    if not settings:
        settings = AgencySettings()
        db.session.add(settings)
    
    # Update plain string fields
    fields = [
        'agency_name', 'logo_url', 'address', 'phone', 
        'email', 'website', 'facebook_url', 'instagram_url', 
        'founder_name', 'founder_designation', 'bkash_number', 'nagad_number', 'rocket_number',
        'bank_name', 'bank_account_name', 'bank_account_number', 'bank_branch', 'bank_routing',
        'bank2_name', 'bank2_account_name', 'bank2_account_number', 'bank2_branch', 'bank2_routing',
        'tagline', 'default_currency', 'default_country'
    ]
    for field in fields:
        if field in data:
            setattr(settings, field, data[field])

    # notification_emails comes in as a list — store as JSON string
    if 'notification_emails' in data:
        import json as _json
        emails = data['notification_emails']
        if isinstance(emails, list):
            # Clean and deduplicate
            emails = list({e.strip() for e in emails if e.strip()})
            settings.notification_emails = _json.dumps(emails)
        elif isinstance(emails, str):
            settings.notification_emails = emails
            
    db.session.commit()
    return jsonify({'message': 'Settings updated', 'settings': settings.to_dict()}), 200


# ─── Agreement Terms ─────────────────────────────────────────────────────────

@admin_docs_bp.route('/agreement-terms', methods=['GET'])
@admin_required
def get_all_terms():
    terms = AgreementTerms.query.order_by(AgreementTerms.created_at.desc()).all()
    return jsonify([t.to_dict() for t in terms]), 200

@admin_docs_bp.route('/agreement-terms/active', methods=['GET'])
@admin_required
def get_active_terms():
    terms = AgreementTerms.query.filter_by(is_active=True).first()
    if not terms:
        return jsonify({'message': 'No active terms found'}), 404
    return jsonify(terms.to_dict()), 200

@admin_docs_bp.route('/agreement-terms', methods=['POST'])
@admin_required
def create_terms():
    data = request.get_json()
    version = data.get('version')
    content = data.get('content')
    
    if not version or not content:
        return jsonify({'message': 'Version and content are required'}), 400
        
    # Deactivate current active
    active_terms = AgreementTerms.query.filter_by(is_active=True).all()
    for t in active_terms:
        t.is_active = False
        
    new_terms = AgreementTerms(
        version=version,
        content=content,
        is_active=True,
        effective_from=datetime.datetime.utcnow()
    )
    db.session.add(new_terms)
    db.session.commit()
    
    return jsonify({'message': 'New agreement terms created', 'terms': new_terms.to_dict()}), 201


# ─── Payments ────────────────────────────────────────────────────────────────

@admin_docs_bp.route('/bookings/<int:booking_id>/payments', methods=['GET'])
@admin_required
def get_payments(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    payments = [p.to_dict() for p in booking.payments]
    return jsonify(payments), 200

@admin_docs_bp.route('/bookings/<int:booking_id>/payments', methods=['POST'])
@admin_required
def add_payment(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    data = request.get_json()
    
    amount = data.get('amount')
    method = data.get('method')
    
    if not amount or not method:
        return jsonify({'message': 'Amount and method are required'}), 400
        
    payment = BookingPayment(
        booking_id=booking.id,
        amount=float(amount),
        method=method,
        transaction_id=data.get('transaction_id'),
        payment_date=data.get('payment_date'),
        notes=data.get('notes'),
        payment_number=f"RCT-{datetime.datetime.utcnow().year}-TMP"
    )
    
    db.session.add(payment)
    
    # Update booking payment_status
    db.session.commit() # save payment first to get id
    payment.payment_number = f"RCT-{datetime.datetime.utcnow().year}-{payment.id:06d}"
    db.session.commit()
    
    # Calculate totals
    total_paid = sum(p.amount for p in booking.payments)
    
    if total_paid >= booking.final_amount:
        booking.payment_status = 'PAID'
    elif total_paid > 0:
        booking.payment_status = 'PARTIAL'
    else:
        booking.payment_status = 'UNPAID'
        
    # Keep backward compatibility
    booking.advance_paid = total_paid
        
    db.session.commit()
    
    return jsonify({'message': 'Payment added', 'payment': payment.to_dict(), 'booking_status': booking.payment_status}), 201

# ─── Documents ───────────────────────────────────────────────────────────────

@admin_docs_bp.route('/bookings/<int:booking_id>/documents', methods=['GET'])
@admin_required
def get_documents(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    docs = [d.to_dict() for d in booking.documents]
    return jsonify(docs), 200

@admin_docs_bp.route('/bookings/<int:booking_id>/documents', methods=['POST'])
@admin_required
def generate_document(booking_id):
    from flask_jwt_extended import get_jwt_identity
    from app.services.document_service import create_document
    
    data = request.get_json()
    doc_type = data.get('doc_type') # INVOICE or AGREEMENT
    
    if not doc_type or doc_type not in ['INVOICE', 'AGREEMENT']:
        return jsonify({'message': 'Invalid or missing doc_type'}), 400
        
    admin_id = get_jwt_identity()
    
    try:
        doc = create_document(booking_id, doc_type, admin_id)
        return jsonify({'message': f'{doc_type} generated successfully', 'document': doc.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': 'Failed to generate document', 'error': str(e)}), 500

