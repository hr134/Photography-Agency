import os
import uuid
import random
import string
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.booking import Booking
from app.models.package import Package
from app.models.booking_event import BookingEvent
from app.models.user import User
from app.services.email_service import send_email

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_bookings():
    current_user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc()).all()
    return jsonify({"bookings": [b.to_dict() for b in bookings]}), 200

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    package_id = data.get('package_id')
    events_data = data.get('events', [])
    
    if not package_id or not events_data:
        return jsonify({"message": "package_id and events array are required"}), 400
        
    contact_info = data.get('contact_info')
    groom_name = data.get('groom_name')
    bride_name = data.get('bride_name')
    district = data.get('district')
    team_requirements = data.get('team_requirements')
    event_details = data.get('requirements')
    client_name = data.get('client_name')
    client_phone = data.get('client_phone')
    client_address = data.get('client_address')
    advance_paid = data.get('advance_paid', 0)
    
    # Payment Info
    payment_method = data.get('payment_system')
    payment_transaction_id = data.get('payment_transaction_id')
    payment_notes = data.get('payment_notes')
    client_email = data.get('client_email')  # Email entered on booking form
    
    # Check if package exists
    package = Package.query.get(package_id)
    if not package:
        return jsonify({"message": "Package not found"}), 404
        
    num_events = len(events_data)
    
    # Calculate total price based on per-event packages
    total_price = 0
    for ev in events_data:
        ev_pkg_id = ev.get('package_id')
        if ev_pkg_id:
            ev_pkg = Package.query.get(ev_pkg_id)
            if ev_pkg:
                total_price += ev_pkg.price
            else:
                total_price += package.price
        else:
            total_price += package.price

    if data.get('total_amount'):
        try:
            total_price = float(data.get('total_amount'))
        except (ValueError, TypeError):
            pass

    # Keep a primary event_date and venue for backward compatibility (using the first event)
    primary_date = None
    if events_data and events_data[0].get('date'):
        try:
            primary_date = datetime.strptime(events_data[0].get('date'), '%Y-%m-%d').date()
        except ValueError:
            pass

    # Create booking
    new_booking = Booking(
        user_id=current_user_id,
        package_id=package.id,
        event_date=primary_date,
        total_amount=total_price,
        final_amount=total_price,
        advance_paid=float(advance_paid) if advance_paid else 0.0,
        status='PENDING',
        venue=events_data[0].get('venue') if events_data else None,
        contact_info=contact_info,
        groom_name=groom_name,
        bride_name=bride_name,
        client_name=client_name,
        client_phone=client_phone,
        client_address=client_address,
        district=district,
        event_details=event_details,
        team_requirements=team_requirements,
        payment_method=payment_method,
        payment_transaction_id=payment_transaction_id,
        payment_notes=payment_notes,
        booking_number=f"BK-{datetime.now().strftime('%Y-%m%d')}{''.join(random.choices(string.ascii_uppercase, k=2))}"
    )
    db.session.add(new_booking)
    db.session.flush() # get ID

    # Create events
    for i, ev in enumerate(events_data):
        ev_date = None
        if ev.get('date'):
            try:
                ev_date = datetime.strptime(ev.get('date'), '%Y-%m-%d').date()
            except ValueError:
                pass
        
        b_event = BookingEvent(
            booking_id=new_booking.id,
            sequence=i + 1,
            event_type=ev.get('event_type'),
            event_date=ev_date,
            start_time=ev.get('start_time'),
            end_time=ev.get('end_time'),
            venue=ev.get('venue'),
            location=ev.get('location'),
            notes=ev.get('notes'),
            package_id=ev.get('package_id'),
            guest_count=ev.get('guest_count'),
            team_requirements=ev.get('team_requirements'),
            is_outdoor=ev.get('is_outdoor', False)
        )
        db.session.add(b_event)
    
    db.session.commit()
    
    # Send email notifications (non-blocking)
    try:
        _send_booking_notifications(
            current_user_id=current_user_id,
            new_booking=new_booking,
            client_email=client_email,
            client_name=client_name,
            client_phone=client_phone,
            groom_name=groom_name,
            bride_name=bride_name,
            primary_date=primary_date,
            payment_method=payment_method,
            payment_transaction_id=payment_transaction_id
        )
    except Exception as email_err:
        print(f"Non-critical error in booking email notifications: {email_err}")

    return jsonify({"message": "Booking created successfully", "booking": new_booking.to_dict()}), 201


def _send_booking_notifications(current_user_id, new_booking, client_email, client_name, client_phone, groom_name, bride_name, primary_date, payment_method, payment_transaction_id):
    user = User.query.get(current_user_id)
    pkg_name = new_booking.package.name if new_booking.package else "Unknown Package"
    site_url = os.environ.get("FRONTEND_URL", "https://photography-agency.onrender.com").rstrip("/")
    bookings_url = f"{site_url}/dashboard"

    # Collect all recipient emails: login email + booking form email (deduplicated)
    email_recipients = set()
    if user and user.email:
        email_recipients.add(user.email.strip().lower())
    if client_email and client_email.strip():
        email_recipients.add(client_email.strip().lower())
    print(f"[Booking Email] Client recipients: {list(email_recipients)}", flush=True)
    if email_recipients:
        subject = f"Booking Confirmed — {pkg_name} | Veloura Creations"
        plain_body = f"""Dear {client_name or user.username},

Thank you for booking with Veloura Creations! We have received your booking and will confirm it shortly.

Booking Number : {new_booking.booking_number}
Package        : {pkg_name}
Total Amount   : BDT {new_booking.total_amount:,.0f}
Advance Paid   : BDT {new_booking.advance_paid:,.0f}

View your booking: {bookings_url}

Best Regards,
Veloura Creations Team"""
        html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1a1a1a;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2a2a2a 0%,#1a1a1a 100%);padding:28px 24px 20px;text-align:center;border-bottom:1px solid #333;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#d8c3a5;text-transform:uppercase;">Veloura Creations</p>
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">Booking Received!</h1>
            <p style="margin:8px 0 0;font-size:12px;color:#888;">We'll confirm your booking shortly.</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 24px 0;">
            <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.6;">
              Dear <strong style="color:#ffffff;">{client_name or user.username}</strong>,<br/><br/>
              Thank you for choosing Veloura Creations! We have successfully received your booking request. Our team will review it and get back to you soon.
            </p>
          </td>
        </tr>

        <!-- Booking Badge -->
        <tr>
          <td style="padding:20px 24px 0;text-align:center;">
            <span style="display:inline-block;background:#d8c3a5;color:#1a1a1a;font-size:13px;font-weight:700;letter-spacing:1px;padding:8px 20px;border-radius:20px;">
              {new_booking.booking_number}
            </span>
          </td>
        </tr>

        <!-- Booking Summary -->
        <tr>
          <td style="padding:20px 24px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#d8c3a5;text-transform:uppercase;font-weight:600;">Booking Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#242424;border-radius:10px;overflow:hidden;">
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Package</td>
                <td style="padding:12px 16px;font-size:13px;color:#d8c3a5;font-weight:600;">{pkg_name}</td>
              </tr>
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;">Event Date</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;">{primary_date.strftime('%d %B %Y') if primary_date else 'As discussed'}</td>
              </tr>
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;">Total Amount</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;">৳ {new_booking.total_amount:,.0f}</td>
              </tr>
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;">Advance Paid</td>
                <td style="padding:12px 16px;font-size:13px;color:#4ade80;font-weight:600;">৳ {new_booking.advance_paid:,.0f}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;">Due Amount</td>
                <td style="padding:12px 16px;font-size:14px;color:#f97316;font-weight:700;">৳ {(new_booking.total_amount - new_booking.advance_paid):,.0f}</td>
              </tr>
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
            <p style="margin:0;font-size:10px;color:#444;letter-spacing:1px;">VELOURA CREATIONS &bull; AUTOMATED CONFIRMATION</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""
        for recipient_email in email_recipients:
            send_email(recipient_email, subject, plain_body, html_body=html_body)
        
    # Send email notification to all configured admin recipients
    from app.models.agency_settings import AgencySettings
    import json as _json
    agency = AgencySettings.query.first()
    
    # Build the list of notification recipients from settings
    raw_notif = agency.notification_emails if agency and agency.notification_emails else '["velouracreations@gmail.com"]'
    try:
        notification_recipients = _json.loads(raw_notif)
    except Exception:
        notification_recipients = ["velouracreations@gmail.com"]
    
    # Remove empty strings and deduplicate
    notification_recipients = list({e.strip() for e in notification_recipients if e.strip()})
    print(f"[Booking Email] Admin recipients: {notification_recipients}", flush=True)
    if notification_recipients:
        admin_subject = f"📋 New Booking — {client_name or 'Client'} | {pkg_name}"
        admin_plain = f"""New Booking Received

Booking Number : {new_booking.booking_number}
Client Name    : {client_name or 'N/A'}
Client Phone   : {client_phone or 'N/A'}
Groom Name     : {groom_name or 'N/A'}
Bride Name     : {bride_name or 'N/A'}
Event Date     : {primary_date.strftime('%d %B %Y') if primary_date else 'N/A'}
Package        : {pkg_name}
Total Amount   : BDT {new_booking.total_amount:,.0f}
Advance Paid   : BDT {new_booking.advance_paid:,.0f}
Due Amount     : BDT {(new_booking.total_amount - new_booking.advance_paid):,.0f}

Log into the admin dashboard to confirm this booking.
"""
        admin_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>New Booking</title>
</head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1a1a1a;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2a2a2a 0%,#1a1a1a 100%);padding:28px 24px 20px;text-align:center;border-bottom:1px solid #333;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;color:#d8c3a5;text-transform:uppercase;">Veloura Creations</p>
            <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:600;">New Booking Received</h1>
            <p style="margin:8px 0 0;font-size:12px;color:#888;">A client has submitted a booking request</p>
          </td>
        </tr>

        <!-- Booking Badge -->
        <tr>
          <td style="padding:20px 24px 0;text-align:center;">
            <span style="display:inline-block;background:#d8c3a5;color:#1a1a1a;font-size:13px;font-weight:700;letter-spacing:1px;padding:8px 20px;border-radius:20px;">
              {new_booking.booking_number}
            </span>
          </td>
        </tr>

        <!-- Client Info Section -->
        <tr>
          <td style="padding:20px 24px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#d8c3a5;text-transform:uppercase;font-weight:600;">Client Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#242424;border-radius:10px;overflow:hidden;">
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Client Name</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;font-weight:500;">{client_name or 'N/A'}</td>
              </tr>
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;">Phone / WhatsApp</td>
                <td style="padding:12px 16px;font-size:13px;color:#d8c3a5;font-weight:600;">{client_phone or 'N/A'}</td>
              </tr>
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;">Groom</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;">{groom_name or 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;">Bride</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;">{bride_name or 'N/A'}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Event Info Section -->
        <tr>
          <td style="padding:16px 24px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#d8c3a5;text-transform:uppercase;font-weight:600;">Event Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#242424;border-radius:10px;overflow:hidden;">
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Event Date</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;font-weight:500;">{primary_date.strftime('%d %B %Y') if primary_date else 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;">Package</td>
                <td style="padding:12px 16px;font-size:13px;color:#d8c3a5;font-weight:600;">{pkg_name}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Financials Section -->
        <tr>
          <td style="padding:16px 24px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#d8c3a5;text-transform:uppercase;font-weight:600;">Financial Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#242424;border-radius:10px;overflow:hidden;">
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Total Amount</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;font-weight:500;">৳ {new_booking.total_amount:,.0f}</td>
              </tr>
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;">Advance Paid</td>
                <td style="padding:12px 16px;font-size:13px;color:#4ade80;font-weight:600;">৳ {new_booking.advance_paid:,.0f}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;">Due Amount</td>
                <td style="padding:12px 16px;font-size:14px;color:#f97316;font-weight:700;">৳ {(new_booking.total_amount - new_booking.advance_paid):,.0f}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Payment Info (if provided) -->
        {"" if not payment_method else f'''
        <tr>
          <td style="padding:16px 24px 0;">
            <p style="margin:0 0 10px;font-size:10px;letter-spacing:2px;color:#d8c3a5;text-transform:uppercase;font-weight:600;">Payment Submitted</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#242424;border-radius:10px;overflow:hidden;">
              <tr style="border-bottom:1px solid #2e2e2e;">
                <td style="padding:12px 16px;font-size:12px;color:#888;width:45%;">Method</td>
                <td style="padding:12px 16px;font-size:13px;color:#ffffff;">{payment_method or "N/A"}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#888;">TXN / Ref</td>
                <td style="padding:12px 16px;font-size:13px;color:#d8c3a5;font-weight:600;">{payment_transaction_id or "N/A"}</td>
              </tr>
            </table>
          </td>
        </tr>
        '''}

        <!-- Footer -->
        <tr>
          <td style="padding:24px;text-align:center;">
            <p style="margin:0 0 16px;font-size:12px;color:#666;">Please log in to the admin dashboard to review and confirm this booking.</p>
            <p style="margin:0;font-size:10px;color:#444;letter-spacing:1px;">VELOURA CREATIONS &bull; AUTOMATED NOTIFICATION</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""
        for recipient in notification_recipients:
            send_email(recipient, admin_subject, admin_plain, html_body=admin_html)


@bookings_bp.route('/<int:id>/accept_agreement', methods=['PUT'])
@jwt_required()
def accept_agreement(id):
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(id)
    if str(booking.user_id) != str(current_user_id):
        return jsonify({"message": "Unauthorized"}), 403
    
    booking.agreement_status = "Confirmed"
    db.session.commit()
    return jsonify({"message": "Agreement accepted", "booking": booking.to_dict()}), 200

@bookings_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_booking(id):
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(id)
    if str(booking.user_id) != str(current_user_id):
        return jsonify({"message": "Unauthorized"}), 403
        
    if booking.status != 'PENDING':
        return jsonify({"message": "Booking cannot be updated as its status is already processed."}), 400
        
    data = request.get_json()
    
    fields = ['contact_info', 'groom_name', 'bride_name', 'district', 'event_details', 
              'client_name', 'client_phone', 'client_address', 'payment_method', 
              'payment_transaction_id', 'payment_notes']
              
    for field in fields:
        if field in data:
            setattr(booking, field, data[field])

    # requirements maps to event_details
    if 'requirements' in data:
        booking.event_details = data['requirements']

    if 'total_amount' in data and data['total_amount']:
        booking.total_amount = float(data['total_amount'])
        booking.final_amount = float(data['total_amount'])

    if 'package_id' in data and data['package_id']:
        booking.package_id = int(data['package_id'])
            
    if 'team_requirements' in data:
        booking.team_requirements = data['team_requirements']
        
    if 'advance_paid' in data:
        booking.advance_paid = float(data['advance_paid']) if data['advance_paid'] else 0.0

    if 'events' in data:
        BookingEvent.query.filter_by(booking_id=booking.id).delete()
        for i, ev in enumerate(data['events']):
            ev_date = None
            raw_date = ev.get('date') or ev.get('event_date')
            if raw_date:
                try:
                    ev_date = datetime.strptime(raw_date[:10], '%Y-%m-%d').date()
                except ValueError:
                    pass
            b_event = BookingEvent(
                booking_id=booking.id,
                sequence=i + 1,
                event_type=ev.get('event_type'),
                event_date=ev_date,
                start_time=ev.get('start_time'),
                end_time=ev.get('end_time'),
                venue=ev.get('venue'),
                location=ev.get('location'),
                notes=ev.get('notes'),
                package_id=ev.get('package_id'),
                guest_count=ev.get('guest_count'),
                team_requirements=ev.get('team_requirements'),
                is_outdoor=ev.get('is_outdoor', False)
            )
            db.session.add(b_event)
            
        if data['events']:
            raw_primary = data['events'][0].get('date') or data['events'][0].get('event_date')
            if raw_primary:
                try:
                    booking.event_date = datetime.strptime(raw_primary[:10], '%Y-%m-%d').date()
                    booking.venue = data['events'][0].get('venue')
                except:
                    pass
                
    db.session.commit()
    return jsonify({"message": "Booking updated successfully", "booking": booking.to_dict()}), 200