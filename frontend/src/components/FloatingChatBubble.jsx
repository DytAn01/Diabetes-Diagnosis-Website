import { useState, useEffect, useRef } from 'react'
import axiosClient from '../api/axiosClient'
import { useChat } from '../context/ChatContext'

export default function FloatingChatBubble() {
  const {
    currentDiagnosis,
    isOpen,
    toggleChat,
    shouldGetAdvice,
    markAdviceRequested
  } = useChat()

  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState(null)
  const messagesEndRef = useRef(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Check Ollama status on mount
  useEffect(() => {
    checkOllamaStatus()
  }, [])

  // Auto get health advice when diagnosis is received
  useEffect(() => {
    if (shouldGetAdvice && currentDiagnosis && ollamaStatus?.available) {
      getHealthAdvice()
      markAdviceRequested()
    }
  }, [shouldGetAdvice, currentDiagnosis, ollamaStatus])

  // Scroll to bottom
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
      console.error('Error checking Ollama status:', error)
      setOllamaStatus({
        available: false,
        message: '❌ Ollama không hoạt động. Chạy: ollama serve',
        setup_url: 'https://ollama.ai'
      })
    }
  }

  const getHealthAdvice = async () => {
    if (!currentDiagnosis) return

    const adviceMsg = {
      id: Date.now(),
      role: 'system',
      content: '📋 Đang phân tích chẩn đoán của bạn...',
      timestamp: new Date()
    }
    setMessages([adviceMsg])
    setLoading(true)

    try {
      const response = await axiosClient.post('/chat/health-advice', {
        diagnosis: currentDiagnosis,
        probability: currentDiagnosis.probability || 0
      })

      setMessages([
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.advice,
          timestamp: new Date()
        }
      ])
      setUnreadCount(1)
    } catch (error) {
      setMessages([
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: `❌ Lỗi: ${error.response?.data?.error || error.message}`,
          timestamp: new Date()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setLoading(true)
    setUnreadCount(0)

    try {
      const response = await axiosClient.post('/chat/send', {
        message: inputValue,
        diagnosis: currentDiagnosis
      })

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMsg])
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Lỗi: ${error.response?.data?.error || error.message}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    toggleChat()
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const clearChat = async () => {
    try {
      await axiosClient.post('/chat/clear')
      setMessages([])
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  // Don't show if no diagnosis data and no messages
  if (!currentDiagnosis && messages.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-96 mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="text-lg">🤖</div>
              <div className="text-sm font-semibold">Trợ Lý Sức Khỏe</div>
            </div>
            <button
              onClick={handleToggle}
              className="text-white hover:bg-white/20 p-1 rounded transition"
            >
              ✕
            </button>
          </div>

          {/* Ollama Status Warning */}
          {!ollamaStatus?.available && (
            <div className="bg-yellow-50 border-l-2 border-yellow-400 px-3 py-2 text-xs text-yellow-800">
              ⚠️ Ollama chưa hoạt động. 
              <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline ml-1">Cài đặt</a>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                <div className="text-center">
                  <p>💬 Sẵn sàng tư vấn</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : msg.role === 'system'
                        ? 'bg-purple-100 text-purple-900 italic'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-3 py-2 rounded-lg text-sm">
                  <div className="animate-spin inline-block mr-2">🔄</div>
                  Đang suy nghĩ...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-2 bg-white space-y-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading && ollamaStatus?.available) {
                    sendMessage()
                  }
                }}
                placeholder={ollamaStatus?.available ? 'Nhập câu hỏi...' : 'Chưa sẵn sàng'}
                disabled={!ollamaStatus?.available || loading}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={!ollamaStatus?.available || loading || !inputValue.trim()}
                className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm font-semibold"
              >
                📤
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 text-xs">
              <button
                onClick={clearChat}
                disabled={!ollamaStatus?.available}
                className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100"
              >
                🗑️
              </button>
              <button
                onClick={checkOllamaStatus}
                className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                🔄
              </button>
              {currentDiagnosis && (
                <button
                  onClick={getHealthAdvice}
                  disabled={!ollamaStatus?.available || loading}
                  className="flex-1 px-2 py-1 bg-purple-200 text-purple-700 rounded hover:bg-purple-300 disabled:bg-gray-100"
                >
                  💡
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className="relative w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl hover:scale-110"
      >
        💬
        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
        {/* Status indicator */}
        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-400 border border-green-600 opacity-75"></div>
      </button>
    </div>
  )
}
