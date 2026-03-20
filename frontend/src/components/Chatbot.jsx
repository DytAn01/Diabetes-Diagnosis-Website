import { useState, useEffect, useRef } from 'react';
import axiosClient from '../api/axiosClient';

export default function Chatbot({ diagnosis = null, isVisible = true, onClose = null }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollmaStatus, setOllamaStatus] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [showInitialAdvice, setShowInitialAdvice] = useState(true);

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  // Get initial health advice when diagnosis is provided
  useEffect(() => {
    if (diagnosis && showInitialAdvice && ollmaStatus?.available) {
      getInitialHealthAdvice();
      setShowInitialAdvice(false);
    }
  }, [diagnosis, ollmaStatus, showInitialAdvice]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkOllamaStatus = async () => {
    try {
      const response = await axiosClient.get('/chat/status');
      setOllamaStatus(response.data);
      if (response.data.models?.length > 0) {
        setModelInfo(response.data.models[0]);
      }
    } catch (error) {
      console.error('❌ Error checking Ollama status:', error);
      setOllamaStatus({
        available: false,
        message: '❌ Ollama không hoạt động',
        setup_url: 'https://ollama.ai'
      });
    }
  };

  const getInitialHealthAdvice = async () => {
    if (!diagnosis) return;

    const advisanceMessage = {
      id: Date.now(),
      role: 'system',
      content: '📋 Đang phân tích kết quả chẩn đoán của bạn...',
      timestamp: new Date()
    };

    setMessages([advisanceMessage]);

    try {
      const response = await axiosClient.post('/chat/health-advice', {
        diagnosis: diagnosis,
        probability: diagnosis.probability || 0
      });

      const adviceMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.advice,
        timestamp: new Date()
      };

      setMessages([adviceMessage]);

      // Add initial greeting
      setTimeout(() => {
        const greetingMessage = {
          id: Date.now() + 2,
          role: 'assistant',
          content: '💬 Xin chào! Tôi là trợ lý sức khỏe của bạn. Bạn có câu hỏi gì về kết quả chẩn đoán hoặc sức khỏe không?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, greetingMessage]);
      }, 1000);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Không thể lấy lời khuyên: ${error.response?.data?.error || error.message}`,
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/chat/send', {
        message: inputValue,
        diagnosis: diagnosis
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Lỗi: ${error.response?.data?.error || error.message}. Vui lòng thử lại.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axiosClient.post('/chat/clear');
      setMessages([]);
      if (diagnosis) {
        getInitialHealthAdvice();
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div>
            <h3 className="font-bold text-gray-800">Trợ Lý Sức Khỏe AI</h3>
            <p className="text-sm text-gray-600">
              {ollmaStatus?.available ? '✅ Sẵn sàng' : '❌ Chưa kết nối'}
              {modelInfo && ` • ${modelInfo}`}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Ollama Not Available Warning */}
      {!ollmaStatus?.available && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex items-start">
            <div className="text-yellow-600 font-bold mr-3">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">Ollama chưa được cài đặt hoặc chưa chạy</p>
              <p className="mt-1">
                <a 
                  href={ollmaStatus?.setup_url || 'https://ollama.ai'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-700 underline hover:text-yellow-900"
                >
                  👉 Nhấp đây để cài đặt Ollama
                </a>
              </p>
              <p className="mt-2 text-xs">Sau khi cài đặt, chạy: <code className="bg-yellow-100 px-2 py-1">ollama pull mistral</code></p>
              <p className="text-xs">Rồi chạy: <code className="bg-yellow-100 px-2 py-1">ollama serve</code></p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.length === 0 && ollmaStatus?.available && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg">💬 Bắt đầu cuộc trò chuyện</p>
              <p className="text-sm mt-2">Hỏi tôi bất kỳ câu hỏi nào về sức khỏe!</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              } ${msg.role === 'system' ? 'bg-purple-100 text-purple-800 italic' : ''}`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin">🔄</div>
                <span>Đang suy nghĩ...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                sendMessage();
              }
            }}
            placeholder={ollmaStatus?.available ? "Nhập câu hỏi của bạn..." : "Ollama không hoạt động"}
            disabled={!ollmaStatus?.available || loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={!ollmaStatus?.available || loading || !inputValue.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-semibold transition-colors"
          >
            📤
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={clearChat}
            disabled={!ollmaStatus?.available}
            className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100"
          >
            🗑️ Xóa
          </button>
          <button
            onClick={checkOllamaStatus}
            className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            🔄 Kiểm tra
          </button>
          {diagnosis && (
            <button
              onClick={getInitialHealthAdvice}
              disabled={!ollmaStatus?.available}
              className="flex-1 px-3 py-1 text-sm bg-purple-200 text-purple-700 rounded hover:bg-purple-300 disabled:bg-gray-100"
            >
              📋 Lời Khuyên
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
