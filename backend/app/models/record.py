from datetime import datetime
from app import db

class DiagnosisRecord(db.Model):
    """Diagnosis record model"""
    __tablename__ = 'records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Input features
    glucose = db.Column(db.Float)
    hba1c = db.Column(db.Float)
    bmi = db.Column(db.Float)
    blood_pressure = db.Column(db.Float)
    waist = db.Column(db.Float)
    age = db.Column(db.Integer)
    family_history = db.Column(db.Boolean)
    insulin = db.Column(db.Float)
    skin_thickness = db.Column(db.Float)
    pregnancies = db.Column(db.Integer)
    note = db.Column(db.Text)
    
    # Results
    risk_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.Enum('low', 'medium', 'high', name='risk_level_enum'), nullable=False)
    model_used = db.Column(db.String(50), nullable=False, default='random_forest')
    model_version = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        prediction = 1 if (self.risk_score is not None and self.risk_score >= 0.5) else 0
        return {
            'id': self.id,
            'user_id': self.user_id,
            'glucose': self.glucose,
            'hba1c': self.hba1c,
            'bmi': self.bmi,
            'blood_pressure': self.blood_pressure,
            'waist': self.waist,
            'age': self.age,
            'family_history': self.family_history,
            'insulin': self.insulin,
            'skin_thickness': self.skin_thickness,
            'pregnancies': self.pregnancies,
            'note': self.note,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'model_used': self.model_used,
            'model_version': self.model_version,
            'prediction': prediction,
            'probability': self.risk_score,
            'created_at': self.created_at.isoformat()
        }
