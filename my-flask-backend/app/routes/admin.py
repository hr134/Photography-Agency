from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from app.extensions import db
from app.models.user import User
from app.models.booking import Booking
from app.models.package import Package
from app.models.team import TeamMember
from app.models.payment import Payment

admin_bp = Blueprint('admin', __name__)

# Admin guard decorator
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
            return jsonify({'message': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/files', methods=['DELETE'])
@admin_required
def delete_file():
    data = request.get_json()
    file_path = data.get('file_path')
    if not file_path:
        return jsonify({'message': 'File path is required'}), 400
    
    # Strip /static/ if it's there and construct physical path
    from flask import current_app
    import os
    
    if file_path.startswith('/static/uploads/'):
        filename = file_path.replace('/static/uploads/', '')
        physical_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        try:
            if os.path.exists(physical_path):
                os.remove(physical_path)
                return jsonify({'message': 'File deleted successfully'}), 200
            else:
                return jsonify({'message': 'File not found'}), 404
        except Exception as e:
            return jsonify({'message': 'Failed to delete file', 'error': str(e)}), 500
    return jsonify({'message': 'Invalid file path'}), 400

# ─── Stats ────────────────────────────────────────────────────────────────────
@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    total_bookings = Booking.query.count()
    pending = Booking.query.filter_by(status='PENDING').count()
    confirmed = Booking.query.filter_by(status='CONFIRMED').count()
    completed = Booking.query.filter_by(status='COMPLETED').count()
    total_revenue = db.session.query(db.func.sum(Booking.total_amount)).scalar() or 0
    total_paid = db.session.query(db.func.sum(Booking.advance_paid)).scalar() or 0
    total_clients = User.query.filter_by(is_admin=False).count()
    total_team = TeamMember.query.count()

    return jsonify({
        'total_bookings': total_bookings,
        'pending': pending,
        'confirmed': confirmed,
        'completed': completed,
        'total_revenue': total_revenue,
        'total_paid': total_paid,
        'total_clients': total_clients,
        'total_team': total_team,
    }), 200

@admin_bp.route('/notifications', methods=['GET'])
@admin_required
def get_notifications():
    """Return unseen/pending counts for each admin nav section."""
    from app.models.contact import ContactMessage
    pending_bookings = Booking.query.filter_by(status='PENDING', is_read=False).count()
    unread_messages = ContactMessage.query.filter_by(status='unread').count()
    return jsonify({
        'bookings': pending_bookings,
        'messages': unread_messages,
    }), 200

# ─── Bookings ─────────────────────────────────────────────────────────────────
@admin_bp.route('/bookings', methods=['GET'])
@admin_required
def get_all_bookings():
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        d = b.to_dict()
        d['client_email'] = b.user.email if b.user else None
        d['client_username'] = b.user.username if b.user else None
        
        # Prefer stored client_phone, fall back to user record
        if not d.get('client_phone') and b.user:
            d['client_phone'] = getattr(b.user, 'phone', None)
        result.append(d)
    return jsonify({'bookings': result}), 200

@admin_bp.route('/calendar-events', methods=['GET'])
@admin_required
def get_calendar_events():
    """Return all booking events with client and booking metadata for the calendar page."""
    from app.models.booking_event import BookingEvent
    events = BookingEvent.query.join(Booking).filter(
        Booking.status != 'CANCELLED'
    ).all()
    result = []
    for ev in events:
        b = ev.booking
        if not b or not ev.event_date:
            continue
        pkg = ev.effective_package() if hasattr(ev, 'effective_package') else (ev.package if hasattr(ev, 'package') else None)
        
        # Resolve assigned team member names from event first, then fallback to booking
        assigned_team = []
        team_ids = ev.assigned_team_members if ev.assigned_team_members else b.assigned_team_members
        if team_ids:
            for member_id in team_ids:
                m = TeamMember.query.get(member_id)
                if m:
                    assigned_team.append({'id': m.id, 'name': m.name, 'role': m.role})
        
        due_amount = (b.final_amount or b.total_amount or 0) - (b.advance_paid or 0)
        
        result.append({
            'booking_id': b.id,
            'booking_number': b.booking_number or f"BK-{b.id:06d}",
            'client_name': b.client_name,
            'client_username': b.user.username if b.user else '',
            'client_phone': b.client_phone or (b.user.phone if b.user and hasattr(b.user, 'phone') else ''),
            'groom_name': b.groom_name or '',
            'bride_name': b.bride_name or '',
            'event_type': ev.event_type or '',
            'event_date': ev.event_date.isoformat() if ev.event_date else None,
            'start_time': ev.start_time or '',
            'end_time': ev.end_time or '',
            'venue': ev.venue or '',
            'location': ev.location or '',
            'package_name': pkg.name if pkg else (b.package.name if b.package else ''),
            'status': b.status,
            'payment_status': b.payment_status,
            'total_amount': b.total_amount or 0,
            'advance_paid': b.advance_paid or 0,
            'due_amount': due_amount,
            'assigned_team': assigned_team,
        })
    return jsonify({'events': result}), 200

@admin_bp.route('/bookings/<int:booking_id>', methods=['GET'])
@admin_required
def get_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    if not booking.is_read:
        booking.is_read = True
        db.session.commit()
    data = booking.to_dict()
    data['client_email'] = booking.user.email if booking.user else None
    data['client_username'] = booking.user.username if booking.user else None
    
    # Prefer stored client_phone, fall back to user record
    if not data.get('client_phone') and booking.user:
        data['client_phone'] = getattr(booking.user, 'phone', None)
    
    # Relationships
    data['events'] = [e.to_dict() for e in booking.events] if hasattr(booking, 'events') else []
    data['payments'] = [p.to_dict() for p in booking.payments] if hasattr(booking, 'payments') else []
    data['documents'] = [d.to_dict() for d in booking.documents] if hasattr(booking, 'documents') else []
    
    return jsonify(data), 200

@admin_bp.route('/bookings/<int:booking_id>', methods=['PUT'])
@admin_required
def update_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    data = request.get_json()
    
    old_status = booking.status
    old_workflow_status = booking.workflow_status

    # Standard booking fields
    fields = [
        'status', 'workflow_status', 'delivery_link', 'delivery_status',
        'agreement_text', 'agreement_status', 'venue', 'event_details',
        'contact_info', 'district', 'extra_hours', 'booking_number',
        'discount', 'final_amount', 'payment_status', 'media_consent',
        'groom_name', 'bride_name', 'total_amount', 'advance_paid',
        'client_name', 'client_phone', 'client_address',
        'payment_method', 'payment_transaction_id', 'deliverables'
    ]
    for field in fields:
        if field in data:
            setattr(booking, field, data[field])
            
    if 'team_requirements' in data:
        booking.team_requirements = data['team_requirements']
    
    if 'assigned_team_members' in data:
        booking.assigned_team_members = data['assigned_team_members']
        
    if 'package_id' in data:
        booking.package_id = data['package_id']

    # Update events if provided
    if 'events' in data:
        from app.models.booking_event import BookingEvent
        from datetime import datetime
        
        # Clear existing events
        BookingEvent.query.filter_by(booking_id=booking.id).delete()
        
        # Add new events
        for i, ev_data in enumerate(data['events']):
            raw_date = ev_data.get('event_date') or ev_data.get('date')
            evt_date = datetime.strptime(raw_date[:10], '%Y-%m-%d').date() if raw_date else None
            new_event = BookingEvent(
                booking_id=booking.id,
                sequence=i+1,
                event_type=ev_data.get('event_type'),
                event_date=evt_date,
                start_time=ev_data.get('start_time'),
                end_time=ev_data.get('end_time'),
                venue=ev_data.get('venue'),
                location=ev_data.get('location'),
                notes=ev_data.get('notes'),
                package_id=ev_data.get('package_id'),
                guest_count=ev_data.get('guest_count'),
                team_requirements=ev_data.get('team_requirements'),
                assigned_team_members=ev_data.get('assigned_team_members')
            )
            db.session.add(new_event)
            
    db.session.commit()

    # Send email notification if statuses changed
    status_changed = (old_status != booking.status)
    workflow_changed = (old_workflow_status != booking.workflow_status)
    
    if (status_changed or workflow_changed) and booking.user and booking.user.email:
        from app.services.email_service import send_email
        subject_parts = []
        
        booking_ref = booking.booking_number or f"BK-{booking.id:06d}"
        package_name = booking.package.name if booking.package else "Unknown Package"
        site_url = os.environ.get("FRONTEND_URL", "https://photography-agency.onrender.com").rstrip("/")
        bookings_url = f"{site_url}/dashboard"
        
        update_lines_html = ""
        update_lines_plain = ""
        
        if status_changed:
            subject_parts.append("Booking Status")
            update_lines_html += f"""
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Booking Status</td>
                <td style="padding:12px 16px;font-size:13px;color:#d8c3a5;font-weight:700;">{booking.status}</td>
              </tr>"""
            update_lines_plain += f"Booking Status : {booking.status}\n"
            
        if workflow_changed:
            subject_parts.append("Workflow Status")
            update_lines_html += f"""
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Workflow Progress</td>
                <td style="padding:12px 16px;font-size:13px;color:#d8c3a5;font-weight:700;">{booking.workflow_status or 'N/A'}</td>
              </tr>"""
            update_lines_plain += f"Workflow Progress: {booking.workflow_status or 'N/A'}\n"

        subject = f"Update on your Veloura Booking ({booking_ref}): {' & '.join(subject_parts)}"
        
        plain_body = f"""Dear {booking.client_name or booking.user.username},

Your booking has been updated. Here are the latest details:

Booking Ref : {booking_ref}
Package     : {package_name}
{update_lines_plain}
View your booking: {bookings_url}

Best Regards,
Veloura Creations Team"""

        html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Booking Update</title>
</head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1a1a1a;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2a2a2a 0%,#1a1a1a 100%);padding:28px 24px 20px;text-align:center;border-bottom:1px solid #333;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#d8c3a5;text-transform:uppercase;">Veloura Creations</p>
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">Booking Updated</h1>
            <p style="margin:8px 0 0;font-size:12px;color:#888;">Your booking has a new status update</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 24px 0;">
            <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.6;">
              Dear <strong style="color:#ffffff;">{booking.client_name or booking.user.username}</strong>,<br/><br/>
              There is an update on your booking. Please see the details below.
            </p>
          </td>
        </tr>

        <!-- Booking Badge -->
        <tr>
          <td style="padding:20px 24px 0;text-align:center;">
            <span style="display:inline-block;background:#d8c3a5;color:#1a1a1a;font-size:13px;font-weight:700;letter-spacing:1px;padding:8px 20px;border-radius:20px;">
              {booking_ref}
            </span>
          </td>
        </tr>

        <!-- Booking Info -->
        <tr>
          <td style="padding:20px 24px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#d8c3a5;text-transform:uppercase;font-weight:600;">Booking Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#242424;border-radius:10px;overflow:hidden;">
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Package</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;font-weight:500;">{package_name}</td>
              </tr>
              {update_lines_html}
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:24px;text-align:center;">
            <a href="{bookings_url}" style="display:inline-block;background:#d8c3a5;color:#1a1a1a;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:30px;letter-spacing:0.5px;">
              View My Bookings →
            </a>
            <p style="margin:16px 0 0;font-size:11px;color:#555;">Or paste this link in your browser:<br/>
              <a href="{bookings_url}" style="color:#d8c3a5;word-break:break-all;">{bookings_url}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 24px 24px;text-align:center;border-top:1px solid #2a2a2a;">
            <p style="margin:16px 0 4px;font-size:11px;color:#555;">Best Regards, <strong style="color:#888;">Veloura Creations Team</strong></p>
            <p style="margin:0;font-size:10px;color:#444;letter-spacing:1px;">VELOURA CREATIONS &bull; AUTOMATED STATUS UPDATE</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""
        send_email(booking.user.email, subject, plain_body, html_body=html_body)


    # Auto-regenerate documents if any exist
    try:
        from app.services.document_service import create_document
        import os
        from flask import current_app
        for doc in booking.documents:
            doc_type = doc.doc_type
            # Delete physical file
            if doc.pdf_path:
                physical = os.path.join(current_app.root_path, doc.pdf_path.lstrip('/'))
                if os.path.exists(physical):
                    os.remove(physical)
            db.session.delete(doc)
            db.session.commit()
            
            # Recreate with updated info
            create_document(booking.id, doc_type, get_jwt_identity())
    except Exception as e:
        print(f"Failed to auto-regenerate document: {e}")

    return jsonify({'message': 'Booking updated successfully', 'booking': booking.to_dict()}), 200

# ─── Documents ────────────────────────────────────────────────────────────────
@admin_bp.route('/bookings/<int:booking_id>/documents', methods=['POST'])
@admin_required
def generate_document(booking_id):
    data = request.get_json()
    doc_type = data.get('doc_type')  # INVOICE or AGREEMENT
    
    if not doc_type:
        return jsonify({'message': 'doc_type is required'}), 400
    if doc_type not in ('INVOICE', 'AGREEMENT'):
        return jsonify({'message': 'doc_type must be INVOICE or AGREEMENT'}), 400

    try:
        from app.services.document_service import create_document
        doc = create_document(booking_id, doc_type, get_jwt_identity())
        return jsonify({'message': 'Document generated successfully', 'document': doc.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': f'Document generation failed: {str(e)}'}), 500

@admin_bp.route('/bookings/<int:booking_id>/documents/<int:doc_id>', methods=['DELETE'])
@admin_required
def delete_document(booking_id, doc_id):
    from app.models.document import Document
    import os
    from flask import current_app
    doc = Document.query.get_or_404(doc_id)
    # Also delete physical PDF file if it exists
    if doc.pdf_path:
        physical = os.path.join(current_app.root_path, doc.pdf_path.lstrip('/'))
        if os.path.exists(physical):
            os.remove(physical)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted successfully'}), 200

# ─── Team Members ─────────────────────────────────────────────────────────────
@admin_bp.route('/team', methods=['GET'])
@admin_required
def get_team():
    members = TeamMember.query.all()
    return jsonify({'team': [m.to_dict() for m in members]}), 200

@admin_bp.route('/team', methods=['POST'])
@admin_required
def add_team_member():
    data = request.get_json()
    name = data.get('name')
    role = data.get('role')

    if not name or not role:
        return jsonify({'message': 'name and role are required'}), 400

    member = TeamMember(
        name=name,
        role=role,
        phone=data.get('phone'),
        fb_id=data.get('fb_id'),
        whatsapp_number=data.get('whatsapp_number'),
        body_model=data.get('body_model'),
        lens=data.get('lens'),
        gimbal_or_softbox=data.get('gimbal_or_softbox'),
        light_setup=data.get('light_setup'),
        living_area=data.get('living_area'),
        payment=data.get('payment'),
        works_experience=data.get('works_experience')
    )
    db.session.add(member)
    db.session.commit()
    return jsonify({'message': 'Team member added', 'member': member.to_dict()}), 201

@admin_bp.route('/team/<int:member_id>', methods=['DELETE'])
@admin_required
def delete_team_member(member_id):
    member = TeamMember.query.get_or_404(member_id)
    db.session.delete(member)
    db.session.commit()
    return jsonify({'message': 'Team member removed'}), 200

@admin_bp.route('/team/<int:member_id>', methods=['PUT'])
@admin_required
def update_team_member(member_id):
    member = TeamMember.query.get_or_404(member_id)
    data = request.get_json()
    
    fields = ['name', 'role', 'phone', 'fb_id', 'whatsapp_number', 'body_model', 'lens', 'gimbal_or_softbox', 'light_setup', 'living_area', 'payment', 'works_experience']
    for field in fields:
        if field in data:
            setattr(member, field, data[field])
            
    db.session.commit()
    return jsonify({'message': 'Team member updated', 'member': member.to_dict()}), 200

# ─── Packages ─────────────────────────────────────────────────────────────────
@admin_bp.route('/packages', methods=['GET'])
@admin_required
def get_admin_packages():
    packages = Package.query.order_by(Package.id.asc()).all()
    return jsonify({'packages': [p.to_dict() for p in packages]}), 200

@admin_bp.route('/packages', methods=['POST'])
@admin_required
def create_package():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    description = data.get('description', '')
    is_popular = data.get('is_popular', False)
    team_requirements = data.get('team_requirements')

    if not name or price is None:
        return jsonify({'message': 'name and price are required'}), 400

    package = Package(
        name=name,
        price=float(price),
        description=description,
        is_popular=bool(is_popular),
        team_requirements=team_requirements,
        features=data.get('features'),
        details=data.get('details')
    )
    db.session.add(package)
    db.session.commit()
    return jsonify({'message': 'Package created successfully', 'package': package.to_dict()}), 201

@admin_bp.route('/packages/<int:package_id>', methods=['PUT'])
@admin_required
def update_package(package_id):
    package = Package.query.get_or_404(package_id)
    data = request.get_json()

    if 'name' in data:
        package.name = data['name']
    if 'price' in data:
        package.price = float(data['price'])
    if 'description' in data:
        package.description = data['description']
    if 'is_popular' in data:
        package.is_popular = bool(data['is_popular'])
    if 'features' in data:
        package.features = data['features']
    if 'details' in data:
        package.details = data['details']
    if 'team_requirements' in data:
        package.team_requirements = data['team_requirements']

    db.session.commit()
    return jsonify({'message': 'Package updated successfully', 'package': package.to_dict()}), 200

@admin_bp.route('/packages/<int:package_id>', methods=['DELETE'])
@admin_required
def delete_package(package_id):
    package = Package.query.get_or_404(package_id)
    db.session.delete(package)
    db.session.commit()
    return jsonify({'message': 'Package deleted successfully'}), 200

# ─── Data Cleanup ─────────────────────────────────────────────────────────────
@admin_bp.route('/wipe-data', methods=['DELETE'])
@admin_required
def wipe_data():
    from app.models.booking_event import BookingEvent
    from app.models.document import Document
    
    try:
        # Delete related to bookings
        BookingEvent.query.delete()
        Document.query.delete()
        Payment.query.delete()
        Booking.query.delete()
        
        # Delete clients (non-admins)
        User.query.filter_by(is_admin=False).delete()
        
        db.session.commit()
        return jsonify({'message': 'All data wiped successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to wipe data: {str(e)}'}), 500
