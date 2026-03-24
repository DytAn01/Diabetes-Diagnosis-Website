import requests
import json
from typing import Generator, Dict, Optional
from openai import OpenAI
import os

class ChatService:
    """Service for Ollama chatbot integration using OpenAI-compatible API"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        """Initialize chat service with Ollama connection info"""
        self.ollama_url = ollama_url
        self.base_url = f"{ollama_url}/v1"
        self.model = "qwen2.5:0.5b"  # Default model
        self.client = OpenAI(
            base_url=self.base_url,
            api_key="ollama", # Key is required but ignored by Ollama
        )
        self.system_prompt = """
Bạn là một trợ lý y tế thông minh chuyên về bệnh tiểu đường. 
HÃY LUÔN phản hồi bằng tiếng Việt.
HÃY SỬ DỤNG ĐỊNH DẠNG MARKDOWN RÕ RÀNG:
- Sử dụng nhiều DÒNG TRỐNG (double newline) giữa các đoạn văn.
- Sử dụng DANH SÁCH có gạch đầu dòng cho các lời khuyên (mỗi ý một dòng, xuống dòng rõ ràng).
- IN ĐẬM các thuật ngữ quan trọng.
- KHÔNG viết tất cả trong một khối văn bản duy nhất. Hãy chia nhỏ thành các đoạn ngắn.
"""
        self.chat_history = []  # Keep conversation context
        
        # System prompt from diabetes_predict/app.py
        self.system_prompt = (
            "Bạn là trợ lý y tế chuyên về bệnh tiểu đường. Trả lời bằng tiếng Việt tự nhiên, chuyên nghiệp. "
            "Cung cấp thông tin dựa trên kiến thức từ ADA (Hiệp hội Tiểu đường Hoa Kỳ) và WHO. "
            "Giải thích các chỉ số xét nghiệm, tư vấn lối sống và ăn uống. "
            "Sử dụng định dạng Markdown rõ ràng (dùng danh sách gạch đầu dòng, in đậm các ý quan trọng, xuống dòng hợp lý) để người dùng dễ đọc trên web. "
            "KHÔNG đưa ra chẩn đoán y khoa chính thức. Luôn kèm theo lời khuyên: 'Kết quả chỉ mang tính tham khảo, "
            "không thay thế lời khuyên của bác sĩ' khi cần thiết."
        )
        
    def is_ollama_available(self) -> bool:
        """Check if Ollama is running"""
        try:
            # Check native tags endpoint
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
        """Generate health advice based on diagnosis result (Legacy method)"""
        risk_level = "cao" if probability > 0.6 else "trung bình" if probability > 0.3 else "thấp"
        
        prompt = f"""
Bệnh nhân có kết quả chẩn đoán tiểu đường như sau:
- Độ nguy hiểm: {risk_level} (xác suất: {probability:.1%})
- Glucose: {diagnosis.get('glucose', 'N/A')} mg/dL
- BMI: {diagnosis.get('bmi', 'N/A')}
- Huyết áp: {diagnosis.get('blood_pressure', 'N/A')} mmHg
- Tuổi: {diagnosis.get('age', 'N/A')}
 
Vui lòng đưa ra lời khuyên cụ thể. 
Sử dụng định dạng Markdown rõ ràng, dùng danh sách gạch đầu dòng, in đậm các ý quan trọng.
Đặc biệt, sử dụng XUỐNG DÒNG (double newline) giữa các phần để dễ đọc.
"""
        return prompt
    
    def send_message(self, message: str, diagnosis_context: Optional[Dict] = None) -> str:
        """Send a message and get response (non-streaming) using OpenAI SDK"""
        
        if not self.is_ollama_available():
            raise Exception("Ollama không hoạt động. Vui lòng khởi động Ollama trước.")
        
        # Prepare system prompt with context if available
        current_system_content = self.system_prompt
        if diagnosis_context:
            current_system_content += f"\n\nThông tin bối cảnh bệnh nhân: Xác suất tiểu đường {diagnosis_context.get('probability', 0):.1%}, BMI {diagnosis_context.get('bmi', 'N/A')}."
        
        messages = [{"role": "system", "content": current_system_content}]
        
        # Add filtered history
        for msg in self.chat_history[-10:]:
            if msg.get('content'):
                messages.append(msg)
        
        messages.append({"role": "user", "content": message})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                stream=False
            )
            
            assistant_message = response.choices[0].message.content
            
            # Store in history
            self.chat_history.append({"role": "user", "content": message})
            self.chat_history.append({"role": "assistant", "content": assistant_message})
            
            if len(self.chat_history) > 20:
                self.chat_history = self.chat_history[-20:]
                
            return assistant_message
            
        except Exception as e:
            return f"Lỗi khi kết nối Ollama: {str(e)}"
    
    def stream_message(self, message: str, diagnosis_context: Optional[Dict] = None) -> Generator[str, None, None]:
        """Send a message and stream response (yields chunks) using OpenAI SDK"""
        
        if not self.is_ollama_available():
            yield "❌ Ollama không hoạt động. Vui lòng khởi động Ollama trước."
            return
        
        current_system_content = self.system_prompt
        if diagnosis_context:
            current_system_content += f"\n\nThông tin bối cảnh bệnh nhân: Xác suất tiểu đường {diagnosis_context.get('probability', 0):.1%}."
        
        messages = [{"role": "system", "content": current_system_content}]
        
        for msg in self.chat_history[-10:]:
            if msg.get('content'):
                messages.append(msg)
        
        messages.append({"role": "user", "content": message})
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                stream=True
            )
            
            full_response = ""
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    full_response += content
                    yield content
            
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
