import requests
import json
from typing import Generator, Dict, Optional

class ChatService:
    """Service for Ollama chatbot integration"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        """Initialize chat service with Ollama connection info"""
        self.ollama_url = ollama_url
        self.model = "mistral"  # Default model
        self.chat_history = []  # Keep conversation context
        
    def is_ollama_available(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def get_available_models(self) -> list:
        """Get list of available Ollama models"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [m['name'] for m in data.get('models', [])]
            return []
        except Exception as e:
            print(f"Error fetching models: {e}")
            return []
    
    def set_model(self, model_name: str):
        """Set the model to use"""
        self.model = model_name
    
    def generate_health_advice(self, diagnosis: Dict, probability: float) -> str:
        """Generate health advice based on diagnosis result"""
        
        risk_level = "cao" if probability > 0.6 else "trung bình" if probability > 0.3 else "thấp"
        diagnosis_status = "nguy cơ tiểu đường cao" if probability > 0.6 else "nguy cơ tiểu đường thấp"
        
        prompt = f"""
Bệnh nhân có kết quả chẩn đoán tiểu đường như sau:
- Độ nguy hiểm: {risk_level} (xác suất: {probability:.1%})
- Glucose: {diagnosis.get('glucose', 'N/A')} mg/dL
- BMI: {diagnosis.get('bmi', 'N/A')}
- Huyết áp: {diagnosis.get('blood_pressure', 'N/A')} mmHg
- Tuổi: {diagnosis.get('age', 'N/A')}
- Tiền sử gia đình: {'Có' if diagnosis.get('family_history') else 'Không'}

Vui lòng đưa ra:
1. Lời khuyên sức khỏe cụ thể dựa trên kết quả
2. Các biện pháp phòng ngừa hoặc cải thiện tình trạng
3. Khuyến cáo đi khám bác sĩ nếu cần thiết

Trả lời bằng Tiếng Việt, ngắn gọn, rõ ràng.
"""
        return prompt
    
    def send_message(self, message: str, diagnosis_context: Optional[Dict] = None) -> str:
        """Send a message and get response (non-streaming)"""
        
        if not self.is_ollama_available():
            raise Exception("Ollama không hoạt động. Vui lòng khởi động Ollama trước.")
        
        # Build context for health-aware chat
        system_prompt = """Bạn là một trợ lý sức khỏe có kiến thức y tế cơ bản. 
Hãy trả lời các câu hỏi về sức khỏe, tiểu đường, lối sống lành mạnh một cách hữu ích, chính xác và thân thiện.
Nếu câu hỏi nặng, khuyến cáo bệnh nhân đi khám bác sĩ.
Trả lời bằng Tiếng Việt."""
        
        # Add diagnosis context if provided
        if diagnosis_context:
            system_prompt += f"\n\nBệnh nhân hiện có: Xác suất tiểu đường {diagnosis_context.get('probability', 0):.1%}, BMI {diagnosis_context.get('bmi', 'N/A')}"
        
        # Prepare messages
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history (last 5 messages for context)
        for msg in self.chat_history[-10:]:
            messages.append(msg)
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                assistant_message = result['message']['content']
                
                # Store in history
                self.chat_history.append({"role": "user", "content": message})
                self.chat_history.append({"role": "assistant", "content": assistant_message})
                
                # Keep history size manageable (last 20 messages)
                if len(self.chat_history) > 20:
                    self.chat_history = self.chat_history[-20:]
                
                return assistant_message
            else:
                return f"Lỗi: {response.status_code} - {response.text}"
        
        except requests.Timeout:
            return "Yêu cầu hết thời gian chờ. Ollama có thể đang xử lý model. Vui lòng thử lại."
        except Exception as e:
            return f"Lỗi khi kết nối Ollama: {str(e)}"
    
    def stream_message(self, message: str, diagnosis_context: Optional[Dict] = None) -> Generator[str, None, None]:
        """Send a message and stream response (yields chunks)"""
        
        if not self.is_ollama_available():
            yield "❌ Ollama không hoạt động. Vui lòng khởi động Ollama trước."
            return
        
        system_prompt = """Bạn là một trợ lý sức khỏe có kiến thức y tế cơ bản. 
Hãy trả lời các câu hỏi về sức khỏe, tiểu đường, lối sống lành mạnh một cách hữu ích, chính xác và thân thiện.
Trả lời bằng Tiếng Việt."""
        
        if diagnosis_context:
            system_prompt += f"\n\nBệnh nhân hiện có: Xác suất tiểu đường {diagnosis_context.get('probability', 0):.1%}"
        
        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in self.chat_history[-10:]:
            messages.append(msg)
        
        messages.append({"role": "user", "content": message})
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": True,
                    "temperature": 0.7
                },
                stream=True,
                timeout=60
            )
            
            full_response = ""
            
            for line in response.iter_lines():
                if line:
                    try:
                        chunk = json.loads(line)
                        if 'message' in chunk:
                            content = chunk['message'].get('content', '')
                            full_response += content
                            yield content
                    except json.JSONDecodeError:
                        continue
            
            # Store in history after complete
            self.chat_history.append({"role": "user", "content": message})
            self.chat_history.append({"role": "assistant", "content": full_response})
            
            if len(self.chat_history) > 20:
                self.chat_history = self.chat_history[-20:]
        
        except Exception as e:
            yield f"\n❌ Lỗi: {str(e)}"
    
    def clear_history(self):
        """Clear chat history"""
        self.chat_history = []
