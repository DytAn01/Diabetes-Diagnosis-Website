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
