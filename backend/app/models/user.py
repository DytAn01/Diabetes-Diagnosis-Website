from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    """User model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    dob = db.Column(db.Date)
    gender = db.Column(db.Enum('male', 'female', 'other', name='user_gender_enum'))
    phone = db.Column(db.String(15))
    avatar_url = db.Column(db.String(500))
    role = db.Column(db.Enum('user', 'admin', name='user_role_enum'), nullable=False, default='user', index=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True, index=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    diagnosis_records = db.relationship('DiagnosisRecord', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password matches hash"""
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'username': self.email.split('@')[0] if self.email else None,
            'email': self.email,
            'full_name': self.full_name,
            'dob': self.dob.isoformat() if self.dob else None,
            'gender': self.gender,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
