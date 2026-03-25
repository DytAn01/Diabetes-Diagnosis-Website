import { useState, useEffect, useRef } from 'react'
import { animate, motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Send, 
  RefreshCw, 
  Trash2, 
  X, 
  Bot, 
  User, 
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import axiosClient from '../api/axiosClient'
import { useChat } from '../context/ChatContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export default function FloatingChatBubble() {
  const {
    currentDiagnosis,
    isOpen,
    toggleChat,
    setIsOpen,
    shouldGetAdvice,
    markAdviceRequested,
    messages,
    setMessages
  } = useChat()

  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState(null)
  const messagesEndRef = useRef(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    checkOllamaStatus()
  }, [])

  useEffect(() => {
    if (shouldGetAdvice && currentDiagnosis && ollamaStatus?.available) {
      getHealthAdvice()
      markAdviceRequested()
    }
  }, [shouldGetAdvice, currentDiagnosis, ollamaStatus])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const checkOllamaStatus = async () => {
    try {
      const response = await axiosClient.get('/chat/status')
      if (response.status === 200 && response.data) {
        setOllamaStatus(response.data)
      }
    } catch (error) {
      setOllamaStatus({
        available: false,
        message: 'Ollama không hoạt động',
        setup_url: 'https://ollama.ai'
      })
    }
  }

  const getHealthAdvice = async () => {
    if (!currentDiagnosis) return

    const assistantMessageId = Date.now()
    const adviceMsg = {
      id: assistantMessageId,
      role: 'assistant',
      content: '📋 **Đang phân tích kết quả chẩn đoán của bạn...**',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages([adviceMsg])
    setLoading(true)

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/chat/health-advice-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          diagnosis: currentDiagnosis,
          probability: currentDiagnosis.probability || 0
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
      if (!isOpen) setUnreadCount(1)
    } catch (error) {
      setMessages([
        {
          id: assistantMessageId,
          role: 'assistant',
          content: `❌ **Lỗi: ${error.message}**`,
          timestamp: new Date(),
          isStreaming: false
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    const assistantMessageId = Date.now() + 1
    const assistantMsg = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInputValue('')
    setLoading(true)
    setUnreadCount(0)

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
          diagnosis: currentDiagnosis
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
      if (!isOpen) setUnreadCount(prev => prev + 1)
    } catch (error) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `❌ **Lỗi kết nối.** Vui lòng thử lại.`, isStreaming: false } 
            : msg
        )
      );
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    toggleChat()
    if (!isOpen) setUnreadCount(0)
  }

  const clearChat = async () => {
    try {
      await axiosClient.post('/chat/clear')
      setMessages([])
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  if (!currentDiagnosis && messages.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased flex items-end justify-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[400px] h-[600px] mr-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 flex flex-col overflow-hidden relative"
          >
            {/* Header */}
            <div className="relative px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 rounded-xl border border-teal-500/30 backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">AI Health Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${ollamaStatus?.available ? 'bg-teal-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                      {ollamaStatus?.available ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-300"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Content Container with custom inner shadow */}
            <div className="flex-1 overflow-y-auto bg-transparent px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Ollama Alert */}
              {!ollamaStatus?.available && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-2 bg-amber-50/80 border border-amber-200/50 backdrop-blur-md p-3 rounded-2xl flex gap-3 text-xs text-amber-800"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold">Ollama Connection Required</p>
                    <p className="mt-0.5 opacity-80 italic">Please ensures Ollama is running on your machine.</p>
                  </div>
                </motion.div>
              )}

              {/* Message List */}
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 px-10 text-center">
                  <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
                    <Sparkles className="w-8 h-8 text-teal-500 opacity-50" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600">Start a conversation</p>
                    <p className="text-xs mt-1 leading-relaxed opacity-70">Lời khuyên AI chuyên môn dựa trên hồ sơ sức khỏe và kết quả chẩn đoán của bạn.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 border ${
                      msg.role === 'user' 
                        ? 'bg-slate-100 border-slate-200 text-slate-600' 
                        : 'bg-teal-50 border-teal-100 text-teal-600'
                    }`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    
                    <div className={`group relative max-w-[80%] px-4 py-3 rounded-2xl shadow-sm border ${
                      msg.role === 'user'
                        ? 'bg-slate-900 border-slate-800 text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none flex gap-1'
                    }`}>
                      <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} leading-relaxed`}>
                        {/* Loader (separate from Markdown) for accessibility and to avoid empty Markdown parsing */}
                        {(msg.content === '' || msg.content === null || msg.content === undefined) ? (
                          <div role="status" aria-live="polite" className="flex items-start gap-2 max-w-[85%]">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {msg.content}
                          </ReactMarkdown>
                        )}
                        {/* {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1.5 bg-teal-400/50 animate-pulse rounded-full align-middle" />} */}
                      </div>
                      
                      {/* Timestamp tooltip on hover (very subtle) */}
                      <div className={`absolute bottom-full mb-1 text-[8px] font-bold uppercase tracking-tighter text-slate-400 opacity-100 transition-opacity ${msg.role === 'user' ? 'right-0' : 'left-0'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-slate-50 shrink-0">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading && ollamaStatus?.available) sendMessage()
                    }}
                    placeholder={ollamaStatus?.available ? "Hỏi về kết quả của bạn..." : "Trợ lý không khả dụng"}
                    disabled={!ollamaStatus?.available || loading}
                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all disabled:opacity-50 text-slate-700 placeholder:text-slate-400 font-medium"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                     <AnimatePresence>
                       {inputValue.trim() && (
                         <motion.button
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.8 }}
                           onClick={sendMessage}
                           className="p-2 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors"
                         >
                           <Send className="w-4 h-4" />
                         </motion.button>
                       )}
                     </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Utility Row */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-50">
                <div className="flex gap-1.5">
                  <button
                      onClick={clearChat}
                      title="Xóa nội dung"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  <button
                    onClick={checkOllamaStatus}
                    title="Kiểm tra kết nối"
                    className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-xl transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                {currentDiagnosis && (
                  <button
                    onClick={getHealthAdvice}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-teal-500 hover:text-white transition-all flex items-center gap-2 border border-slate-200 hover:border-teal-400 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Lời khuyên y tế
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`relative w-16 h-16 rounded-[24px] bg-slate-900 border-2 border-white/20 shadow-2xl flex items-center justify-center transition-all ${unreadCount > 0 ? 'bg-teal-500' : ''}`}
      >
        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white" />
        )}
        
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-teal-500 border-2 border-white text-[10px] font-bold text-white items-center justify-center shadow-lg">
              {unreadCount}
            </span>
          </span>
        )}
      </motion.button>
    </div>
  )
}
