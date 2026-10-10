from flask import Blueprint, request, jsonify, current_app
from app.models.contact import ContactMessage
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.email import send_email

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('', methods=['POST'])
def submit_message():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({'message': 'Name, email, and message are required'}), 400

    new_msg = ContactMessage(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        event_date=data.get('eventDate'),
        event_location=data.get('eventLocation'),
        message=data.get('message')
    )

    try:
        db.session.add(new_msg)
        db.session.commit()

        # ── Send notification email to admin ───────────────────────────────
        try:
            from datetime import datetime
            submitted_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
            phone_display = new_msg.phone or 'Not provided'

            text_body = (
                f"New Portfolio Inquiry\n"
                f"{'='*40}\n"
                f"Name    : {new_msg.name}\n"
                f"Email   : {new_msg.email}\n"
                f"Phone   : {phone_display}\n"
                f"Time    : {submitted_at}\n"
                f"{'='*40}\n\n"
                f"{new_msg.message}\n\n"
                f"Reply directly to: {new_msg.email}"
            )

            html_body = f"""
<html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:#0a0a0a;padding:24px 32px;">
      <h2 style="color:#ffffff;margin:0;font-size:18px;letter-spacing:2px;">NEW INQUIRY — HARUN RASHID PORTFOLIO</h2>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
        <tr><td style="padding:8px 0;font-weight:bold;width:80px;color:#666;">Name</td><td style="padding:8px 0;">{new_msg.name}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:{new_msg.email}" style="color:#6d28d9;">{new_msg.email}</a></td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#666;">Phone</td><td style="padding:8px 0;">{phone_display}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;color:#666;">Time</td><td style="padding:8px 0;">{submitted_at}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <h3 style="font-size:13px;color:#666;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">Message</h3>
      <p style="font-size:15px;line-height:1.7;color:#111;white-space:pre-wrap;margin:0;">{new_msg.message}</p>
      <div style="margin-top:24px;">
        <a href="mailto:{new_msg.email}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:1px;">REPLY NOW</a>
      </div>
    </div>
    <div style="background:#f5f5f5;padding:16px 32px;font-size:11px;color:#999;">This is an automated notification from your portfolio contact form.</div>
  </div>
</body></html>"""

            send_email(
                subject=f"[Portfolio Inquiry] {new_msg.name} — {new_msg.email}",
                sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@velouracreations.com'),
                recipients=['hr1349891@gmail.com'],
                text_body=text_body,
                html_body=html_body,
            )
        except Exception as mail_err:
            # Log but don't fail the request if email fails
            current_app.logger.warning(f"Email notification failed: {mail_err}")
        # ── End email ──────────────────────────────────────────────────────

        return jsonify({'message': 'Message sent successfully', 'contact': new_msg.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'An error occurred while saving the message'}), 500

@contact_bp.route('', methods=['GET'])
@jwt_required()
def get_messages():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

@contact_bp.route('/<int:id>/status', methods=['PUT'])
@jwt_required()
def update_status(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ['unread', 'read']:
        return jsonify({'message': 'Invalid status'}), 400

    msg = ContactMessage.query.get(id)
    if not msg:
        return jsonify({'message': 'Message not found'}), 404

    msg.status = new_status
    try:
        db.session.commit()
        return jsonify({'message': 'Status updated', 'contact': msg.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'An error occurred'}), 500

@contact_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_message(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    msg = ContactMessage.query.get(id)
    if not msg:
        return jsonify({'message': 'Message not found'}), 404

    try:
        db.session.delete(msg)
        db.session.commit()
        return jsonify({'message': 'Message deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'An error occurred'}), 500
