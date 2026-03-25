from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
from datetime import date
from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validation
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip()

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email đã tồn tại'}), 409

    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({'error': 'Số điện thoại đã tồn tại'}), 409
    
    full_name = data.get('full_name') or data.get('username') or data['email'].split('@')[0]

    dob_value = None
    if data.get('dob'):
        try:
            dob_value = date.fromisoformat(data['dob'])
        except ValueError:
            return jsonify({'error': 'Invalid dob format. Expected YYYY-MM-DD'}), 400

    gender = (data.get('gender') or '').lower() or None
    if gender and gender not in ('male', 'female', 'other'):
        return jsonify({'error': 'Invalid gender value'}), 400

    # Create new user
    user = User(
        email=email,
        full_name=full_name,
        dob=dob_value,
        gender=gender,
        phone=phone if phone else None,
        avatar_url=data.get('avatar_url'),
        role='user',
        is_active=True
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    identifier = data.get('email') or data.get('username')
    if not identifier or not data.get('password'):
        return jsonify({'error': 'Missing email/username or password'}), 400
    
    if '@' in identifier:
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter(User.email.like(f'{identifier}@%')).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Sai tài khoản hoặc mật khẩu'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    identity = get_jwt_identity()
    user = None

    if isinstance(identity, str) and identity.isdigit():
        user = db.session.get(User, int(identity))
    elif isinstance(identity, int):
        user = db.session.get(User, identity)
    elif isinstance(identity, str):
        user = User.query.filter_by(email=identity).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile with role-based permissions"""
    identity = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    user = None
    if isinstance(identity, str) and identity.isdigit():
        user = db.session.get(User, int(identity))
    elif isinstance(identity, int):
        user = db.session.get(User, identity)
    elif isinstance(identity, str):
        user = User.query.filter_by(email=identity).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Default user: can only edit full_name, email, phone
    editable_fields = {'full_name', 'email', 'phone'}

    # Admin: can edit all profile fields below
    if user.role == 'admin':
        editable_fields.update({'dob', 'gender', 'avatar_url', 'role', 'is_active'})

    # Validate unauthorized fields
    unauthorized_fields = [key for key in data.keys() if key not in editable_fields]
    if unauthorized_fields:
        return jsonify({'error': f'You are not allowed to edit fields: {", ".join(unauthorized_fields)}'}), 403

    if 'full_name' in data:
        full_name = (data.get('full_name') or '').strip()
        if not full_name:
            return jsonify({'error': 'full_name cannot be empty'}), 400
        user.full_name = full_name

    if 'email' in data:
        email = (data.get('email') or '').strip().lower()
        if not email:
            return jsonify({'error': 'email cannot be empty'}), 400
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        existing_user = User.query.filter(
            User.email == email,
            User.id != user.id
        ).first()
        if existing_user:
            return jsonify({'error': 'Email already exists'}), 409
        user.email = email

    if 'phone' in data:
        phone = (data.get('phone') or '').strip()
        if phone:
            existing_phone_user = User.query.filter(
                User.phone == phone,
                User.id != user.id
            ).first()
            if existing_phone_user:
                return jsonify({'error': 'Số điện thoại đã tồn tại'}), 409
        user.phone = phone if phone else None

    if user.role == 'admin':
        if 'dob' in data:
            dob_raw = data.get('dob')
            if dob_raw:
                try:
                    user.dob = date.fromisoformat(dob_raw)
                except ValueError:
                    return jsonify({'error': 'Invalid dob format. Expected YYYY-MM-DD'}), 400
            else:
                user.dob = None

        if 'gender' in data:
            gender = (data.get('gender') or '').lower().strip() or None
            if gender and gender not in ('male', 'female', 'other'):
                return jsonify({'error': 'Invalid gender value'}), 400
            user.gender = gender

        if 'avatar_url' in data:
            avatar_url = (data.get('avatar_url') or '').strip()
            user.avatar_url = avatar_url if avatar_url else None

        if 'role' in data:
            role = (data.get('role') or '').strip().lower()
            if role not in ('user', 'admin'):
                return jsonify({'error': 'Invalid role value'}), 400
            user.role = role

        if 'is_active' in data:
            user.is_active = bool(data.get('is_active'))

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200
