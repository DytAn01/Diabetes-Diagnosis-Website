from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.models.record import DiagnosisRecord
from app.models.user import User
from app.services.predict_service import PredictService
from app.services.location_service import LocationService
from app.utils.validators import validate_prediction_input

predict_bp = Blueprint('predict', __name__)
predict_service = PredictService()
location_service = LocationService()


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
    identity = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    # Resolve user_id from JWT identity safely (supports both numeric id and email identity)
    user_id = None
    if isinstance(identity, int):
        user_id = identity
    elif isinstance(identity, str):
        normalized = identity.strip()
        if normalized.isdigit():
            user_id = int(normalized)
        elif normalized:
            user = User.query.filter_by(email=normalized).first()
            if user:
                user_id = user.id

    if user_id is None:
        return jsonify({'error': 'Invalid authentication identity. Please login again.'}), 401

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found. Please login again.'}), 401
    
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
        
        response_payload = {
            'prediction': prediction,
            'probability': float(probability),
            'risk_score': float(probability),
            'risk_level': risk_level,
            'message': 'Diabetes detected' if prediction == 1 else 'No diabetes detected'
        }

        # Save record (best effort: do not fail diagnosis response if DB write fails)
        try:
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
            response_payload['record_id'] = record.id
            response_payload['record_saved'] = True
        except SQLAlchemyError as db_error:
            db.session.rollback()
            response_payload['record_saved'] = False
            response_payload['warning'] = f'Prediction succeeded but failed to save history: {str(db_error)}'

        return jsonify(response_payload), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@predict_bp.route('/nearby-facilities', methods=['POST'])
def get_nearby_facilities():
    """
    Get nearby hospitals and clinics based on user location
    
    Request body:
    {
        "latitude": float,
        "longitude": float,
        "radius_km": float (optional, default 5),
        "limit": int (optional, default 10)
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'latitude' not in data or 'longitude' not in data:
            return jsonify({'error': 'latitude and longitude are required'}), 400
        
        latitude = float(data.get('latitude'))
        longitude = float(data.get('longitude'))
        radius_km = float(data.get('radius_km', 5))
        limit = int(data.get('limit', 10))
        
        # Validate ranges
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            return jsonify({'error': 'Invalid latitude or longitude'}), 400
        
        if radius_km < 0.5 or radius_km > 50:
            return jsonify({'error': 'radius_km must be between 0.5 and 50'}), 400
        
        if limit < 1 or limit > 50:
            return jsonify({'error': 'limit must be between 1 and 50'}), 400
        
        # Get nearby facilities
        result = location_service.get_nearby_facilities(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            limit=limit
        )
        
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
