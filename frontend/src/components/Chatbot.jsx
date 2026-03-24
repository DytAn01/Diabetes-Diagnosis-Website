import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  RefreshCw, 
  Trash2, 
  X, 
  Bot, 
  User, 
  Sparkles,
  AlertCircle,
  Activity,
  Heart,
  Stethoscope,
  Info
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import { useChat } from '../context/ChatContext';

export default function Chatbot({ diagnosis = null, isVisible = null, onClose = null }) {
  const {
    messages,
    setMessages,
    isOpen,
    setIsOpen,
    currentDiagnosis,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [ollmaStatus, setOllamaStatus] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [showInitialAdvice, setShowInitialAdvice] = useState(true);

  // Use props if provided, otherwise use context
  const activeDiagnosis = diagnosis || currentDiagnosis;
  const activeIsVisible = isVisible !== null ? isVisible : isOpen;
  const activeOnClose = onClose || (() => setIsOpen(false));

  // API Base URL from env or default
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    checkOllamaStatus();
  }, []);

  useEffect(() => {
    if (activeDiagnosis && showInitialAdvice && ollmaStatus?.available) {
      getInitialHealthAdvice();
      setShowInitialAdvice(false);
    }
  }, [activeDiagnosis, ollmaStatus, showInitialAdvice]);

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
      setOllamaStatus({
        available: false,
        message: 'Ollama không hoạt động',
        setup_url: 'https://ollama.ai'
      });
    }
  };

  const getInitialHealthAdvice = async () => {
    if (!activeDiagnosis) return;

    const assistantMessageId = Date.now();
    const advisanceMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '📋 **Đang phân tích dữ liệu y tế của bạn...**',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages([advisanceMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/chat/health-advice-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          diagnosis: activeDiagnosis,
          probability: activeDiagnosis.probability || 0
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.replace('data: ', '');
            if (content) {
              fullContent += content;
              setMessages([{
                id: assistantMessageId,
                role: 'assistant',
                content: fullContent,
                timestamp: new Date(),
                isStreaming: true
              }]);
            }
          }
        }
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

      setTimeout(() => {
        const greetingMessage = {
          id: Date.now() + 2,
          role: 'assistant',
          content: '👋 **Xin chào!** Tôi đã xem qua kết quả của bạn. Bạn có muốn hỏi thêm gì về các chỉ số hoặc chế độ dinh dưỡng không?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, greetingMessage]);
      }, 500);

    } catch (error) {
      setMessages([{
        id: assistantMessageId,
        role: 'assistant',
        content: `❌ **Lỗi:** ${error.message}`,
        timestamp: new Date(),
        isStreaming: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputValue,
          diagnosis: activeDiagnosis
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.replace('data: ', '');
            if (content) {
              fullContent += content;
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent } 
                    : msg
                )
              );
            }
          }
        }
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `❌ **Lỗi:** Vui lòng kiểm tra lại kết nối.`, isStreaming: false } 
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await axiosClient.post('/chat/clear');
      setMessages([]);
      setShowInitialAdvice(true);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  if (!activeIsVisible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-50/50 rounded-[32px] overflow-hidden border border-slate-200 shadow-[0_32px_120px_rgba(0,0,0,0.1)] flex flex-col h-[700px] font-sans antialiased">
      {/* Dynamic Background Mesh (CSS Only) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-200/20 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-6 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
               <Stethoscope className="w-7 h-7 text-teal-400 -rotate-3" />
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Trợ lý AI lâm sàng</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-teal-100">
                <Activity size={10} /> Giám sát trực tiếp
              </span>
              <span className="text-xs text-slate-400 font-medium italic">
                {modelInfo ? `v1.2 • ${modelInfo}` : 'Đang kết nối...'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            {activeOnClose && (
              <button
                onClick={activeOnClose}
                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            )}
        </div>
      </header>

      {/* Messages Window */}
      <div className="relative z-10 flex-1 overflow-y-auto px-8 py-8 space-y-8 no-scrollbar">
        {/* Connection Tooltip */}
        {!ollmaStatus?.available && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4 text-sm text-amber-900 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold">Cần kết nối Ollama</p>
              <p className="opacity-70 mt-0.5 italic">Trợ lý ảo này yêu cầu một phiên Ollama cục bộ để xử lý dữ liệu y tế.</p>
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 font-bold text-amber-700 hover:underline">Tải Ollama &rarr;</a>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-12 space-y-6 opacity-30">
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-[40px]">
              <Heart className="w-16 h-16 text-slate-400" />
            </div>
            <div className="max-w-md">
                <h2 className="text-xl font-bold text-slate-800">Tư vấn bảo mật</h2>
                <p className="text-sm mt-2 font-medium">Dữ liệu của bạn được xử lý cục bộ. Hỏi về các chỉ số tiểu đường, dinh dưỡng hoặc điều chỉnh lối sống.</p>
            </div>
          </div>
        )}

        {/* Message Mapping */}
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-teal-500 shadow-sm shrink-0">
                <Sparkles size={18} />
              </div>
            )}
            
            <div className={`group relative max-w-[70%] px-7 py-5 rounded-[28px] shadow-[0_2px_15px_rgba(0,0,0,0.02)] border ${
              msg.role === 'user'
                ? 'bg-slate-900 border-slate-800 text-white rounded-tr-none'
                : 'bg-white border-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} leading-relaxed`}>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {msg.content}
                </ReactMarkdown>
                {msg.isStreaming && <span className="inline-block w-2 h-5 ml-2 bg-teal-400/40 animate-pulse rounded-full align-middle" />}
              </div>
              
              <div className={`absolute bottom-full mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'right-0' : 'left-0'}`}>
                {msg.role === 'user' ? 'Bạn' : 'Trợ lý AI'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="mt-1 w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                <User size={18} />
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <footer className="relative z-10 p-8 bg-white/70 backdrop-blur-xl border-t border-slate-100 shrink-0">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading && ollmaStatus?.available) sendMessage();
              }}
              placeholder={ollmaStatus?.available ? "Discuss your health data or ask a follow-up..." : "Database Syncing..."}
              disabled={!ollmaStatus?.available || loading}
              placeholder={ollmaStatus?.available ? "Thảo luận dữ liệu sức khỏe hoặc hỏi thêm..." : "Đang đồng bộ dữ liệu..."}
              className="w-full pl-6 pr-16 py-5 bg-white border-2 border-slate-100 rounded-[28px] text-base focus:outline-none focus:ring-8 focus:ring-teal-500/5 focus:border-teal-500 transition-all shadow-sm shadow-slate-200/50 placeholder:text-slate-300 font-medium"
            />
            <button
              onClick={sendMessage}
              disabled={!ollmaStatus?.available || loading || !inputValue.trim()}
              className="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-teal-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 disabled:bg-slate-50 disabled:text-slate-200 transition-all flex items-center gap-2 overflow-hidden group/btn"
            >
              <span className="hidden sm:inline">Dispatch</span>
              <Send size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Gửi</span>
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex gap-4">
               <button
                 onClick={clearChat}
                 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
               >
                 <Trash2 size={12} /> Clear Log
               </button>
               <button
                 onClick={checkOllamaStatus}
                 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors"
               >
                 <RefreshCw size={12} /> System Check
               </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase whitespace-nowrap">Encryption Active</span>
              </div>
              {activeDiagnosis && (
                <button
                  onClick={getInitialHealthAdvice}
                  disabled={loading}
                  className="px-5 py-2.5 bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  <Activity size={12} /> Generate Advice
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
