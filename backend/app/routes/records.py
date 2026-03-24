from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.record import DiagnosisRecord

records_bp = Blueprint('records', __name__)

@records_bp.route('/', methods=['GET'])
@jwt_required()
def get_records():
    """Get all records for current user"""
    user_id = int(get_jwt_identity())
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    records = DiagnosisRecord.query.filter_by(user_id=user_id).order_by(
        DiagnosisRecord.created_at.desc()
    ).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'records': [record.to_dict() for record in records.items],
        'total': records.total,
        'pages': records.pages,
        'current_page': page
    }), 200

@records_bp.route('/<int:record_id>', methods=['GET'])
@jwt_required()
def get_record(record_id):
    """Get a specific record"""
    user_id = int(get_jwt_identity())
    record = db.session.get(DiagnosisRecord, record_id)
    
    if not record or record.user_id != user_id:
        return jsonify({'error': 'Record not found'}), 404
    
    return jsonify(record.to_dict()), 200

@records_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    """Delete a specific record"""
    user_id = int(get_jwt_identity())
    record = db.session.get(DiagnosisRecord, record_id)
    
    if not record or record.user_id != user_id:
        return jsonify({'error': 'Record not found'}), 404
    
    db.session.delete(record)
    db.session.commit()
    
    return jsonify({'message': 'Record deleted successfully'}), 200
@records_bp.route('/tracker/stats', methods=['GET'])
@jwt_required()
def get_health_tracker():
    """Get health tracker data for charts (time series)"""
    user_id = int(get_jwt_identity())
    
    # Get all records for user, ordered by date
    records = DiagnosisRecord.query.filter_by(user_id=user_id).order_by(
        DiagnosisRecord.created_at.asc()
    ).all()
    
    if not records:
        return jsonify({'error': 'No records found'}), 404
    
    # Extract time series data
    dates = []
    glucose_data = []
    bmi_data = []
    blood_pressure_data = []
    insulin_data = []
    risk_score_data = []
    
    for record in records:
        # Format date as YYYY-MM-DD
        date_str = record.created_at.strftime('%Y-%m-%d')
        dates.append(date_str)
        
        glucose_data.append(record.glucose)
        bmi_data.append(record.bmi)
        blood_pressure_data.append(record.blood_pressure)
        insulin_data.append(record.insulin)
        risk_score_data.append(record.risk_score)
    
    # Calculate statistics
    def calc_stats(data):
        data = [v for v in data if v is not None]
        if not data:
            return {'min': 0, 'max': 0, 'avg': 0, 'current': 0}
        return {
            'min': min(data),
            'max': max(data),
            'avg': sum(data) / len(data),
            'current': data[-1] if data else 0,
            'trend': 'improving' if len(data) > 1 and data[-1] < data[-2] else 'stable' if len(data) > 1 and data[-1] == data[-2] else 'worsening'
        }
    
    return jsonify({
        'dates': dates,
        'glucose': {
            'data': glucose_data,
            'stats': calc_stats(glucose_data),
            'unit': 'mg/dL'
        },
        'bmi': {
            'data': bmi_data,
            'stats': calc_stats(bmi_data),
            'unit': 'kg/m²'
        },
        'blood_pressure': {
            'data': blood_pressure_data,
            'stats': calc_stats(blood_pressure_data),
            'unit': 'mmHg'
        },
        'insulin': {
            'data': insulin_data,
            'stats': calc_stats(insulin_data),
            'unit': 'µU/ml'
        },
        'risk_score': {
            'data': risk_score_data,
            'stats': calc_stats(risk_score_data),
            'unit': 'score'
        },
        'total_records': len(records)
    }), 200