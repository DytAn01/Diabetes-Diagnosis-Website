import { createContext, useContext, useState, useCallback } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [shouldGetAdvice, setShouldGetAdvice] = useState(false)

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
        markAdviceRequested
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
