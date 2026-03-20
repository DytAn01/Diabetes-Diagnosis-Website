from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.record import DiagnosisRecord
from app.services.predict_service import PredictService
from app.utils.validators import validate_prediction_input

predict_bp = Blueprint('predict', __name__)
predict_service = PredictService()


def get_risk_level(risk_score):
    if risk_score < 0.3:
        return 'low'
    if risk_score < 0.6:
        return 'medium'
    return 'high'

@predict_bp.route('/', methods=['POST'])
@jwt_required()
def predict():
    """Make a prediction"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Validate input
    is_valid, error = validate_prediction_input(data)
    if not is_valid:
        return jsonify({'error': error}), 400
    
    try:
        # Make prediction
        prediction, probability = predict_service.predict(data)
        risk_level = get_risk_level(float(probability))
        family_history_raw = data.get('family_history', 0)
        family_history = bool(int(family_history_raw)) if str(family_history_raw).strip().isdigit() else bool(family_history_raw)
        
        # Save record
        record = DiagnosisRecord(
            user_id=user_id,
            glucose=data.get('glucose'),
            hba1c=data.get('hba1c'),
            bmi=data.get('bmi'),
            blood_pressure=data.get('blood_pressure'),
            waist=data.get('waist'),
            age=int(data.get('age')) if data.get('age') is not None else None,
            family_history=family_history,
            insulin=data.get('insulin'),
            skin_thickness=data.get('skin_thickness'),
            pregnancies=int(data.get('pregnancies')) if data.get('pregnancies') is not None else None,
            note=data.get('note'),
            risk_score=float(probability),
            risk_level=risk_level,
            model_used='random_forest',
            model_version=data.get('model_version')
        )
        
        db.session.add(record)
        db.session.commit()
        
        return jsonify({
            'prediction': prediction,
            'probability': float(probability),
            'risk_score': float(probability),
            'risk_level': risk_level,
            'record_id': record.id,
            'message': 'Diabetes detected' if prediction == 1 else 'No diabetes detected'
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
