import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  // Load from localStorage on init
  const savedDiagnosis = JSON.parse(localStorage.getItem('chat_diagnosis'))
  const savedIsOpen = localStorage.getItem('chat_is_open') === 'true'
  const savedMessages = JSON.parse(localStorage.getItem('chat_messages')) || []

  const [currentDiagnosis, setCurrentDiagnosis] = useState(savedDiagnosis)
  const [isOpen, setIsOpen] = useState(savedIsOpen)
  const [messages, setMessages] = useState(savedMessages)
  const [shouldGetAdvice, setShouldGetAdvice] = useState(false)

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('chat_diagnosis', JSON.stringify(currentDiagnosis))
  }, [currentDiagnosis])

  useEffect(() => {
    localStorage.setItem('chat_is_open', isOpen)
  }, [isOpen])

  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages))
  }, [messages])

  const setDiagnosis = useCallback((diagnosis) => {
    setCurrentDiagnosis(diagnosis)
    if (diagnosis) {
      setShouldGetAdvice(true)
      // Auto open chat when diagnosis received
      setIsOpen(true)
    }
  }, [])

  const clearDiagnosis = useCallback(() => {
    setCurrentDiagnosis(null)
    setShouldGetAdvice(false)
  }, [])

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const markAdviceRequested = useCallback(() => {
    setShouldGetAdvice(false)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        currentDiagnosis,
        setDiagnosis,
        clearDiagnosis,
        isOpen,
        setIsOpen,
        toggleChat,
        shouldGetAdvice,
        markAdviceRequested,
        messages,
        setMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
