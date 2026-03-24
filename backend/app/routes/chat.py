from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required
from app.services.chat_service import ChatService

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService()

@chat_bp.route('/status', methods=['GET'])
def chat_status():
    """Check if Ollama is available"""
    is_available = chat_service.is_ollama_available()
    models = chat_service.get_available_models() if is_available else []
    
    return jsonify({
        'available': is_available,
        'message': '✅ Ollama hoạt động' if is_available else '❌ Ollama không hoạt động. Vui lòng chạy: ollama serve',
        'models': models,
        'current_model': chat_service.model if is_available else None,
        'setup_url': 'https://ollama.ai'
    }), 200

@chat_bp.route('/models', methods=['GET'])
def get_models():
    """Get available Ollama models"""
    try:
        models = chat_service.get_available_models()
        return jsonify({'models': models}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/set-model', methods=['POST'])
@jwt_required()
def set_model():
    """Set the model to use"""
    data = request.get_json()
    model_name = data.get('model')
    
    if not model_name:
        return jsonify({'error': 'Model name required'}), 400
    
    try:
        chat_service.set_model(model_name)
        return jsonify({
            'message': f'Model set to {model_name}',
            'current_model': chat_service.model
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to the chatbot (non-streaming)"""
    data = request.get_json()
    message = data.get('message')
    diagnosis_context = data.get('diagnosis')  # Optional diagnosis context
    
    if not message:
        return jsonify({'error': 'Message required'}), 400
    
    try:
        response = chat_service.send_message(message, diagnosis_context)
        return jsonify({
            'message': response,
            'model': chat_service.model,
            'timestamp': __import__('datetime').datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/stream', methods=['POST'])
@jwt_required()
def stream_message():
    """Send a message to the chatbot (streaming)"""
    data = request.get_json()
    message = data.get('message')
    diagnosis_context = data.get('diagnosis')
    
    if not message:
        return jsonify({'error': 'Message required'}), 400
    
    def generate():
        try:
            for chunk in chat_service.stream_message(message, diagnosis_context):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: ❌ Lỗi: {str(e)}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

@chat_bp.route('/health-advice', methods=['POST'])
@jwt_required()
def get_health_advice():
    """Get health advice based on diagnosis result"""
    data = request.get_json()
    diagnosis = data.get('diagnosis', {})
    probability = data.get('probability', 0)
    
    try:
        prompt = chat_service.generate_health_advice(diagnosis, probability)
        response = chat_service.send_message(prompt)
        
        return jsonify({
            'advice': response,
            'probability': probability,
            'model': chat_service.model
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/health-advice-stream', methods=['POST'])
@jwt_required()
def get_health_advice_stream():
    """Get health advice based on diagnosis result (streaming)"""
    data = request.get_json()
    diagnosis = data.get('diagnosis', {})
    probability = data.get('probability', 0)
    
    prompt = chat_service.generate_health_advice(diagnosis, probability)
    
    def generate():
        try:
            for chunk in chat_service.stream_message(prompt):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            yield f"data: ❌ Lỗi: {str(e)}\n\n"
            
    return Response(generate(), mimetype='text/event-stream')

@chat_bp.route('/clear', methods=['POST'])
@jwt_required()
def clear_chat():
    """Clear chat history"""
    try:
        chat_service.clear_history()
        return jsonify({'message': 'Chat history cleared'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
