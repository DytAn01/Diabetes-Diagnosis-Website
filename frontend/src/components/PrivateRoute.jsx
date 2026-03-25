import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import LoginModal from './LoginModal'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated && !loading)

  if (loading) return <div className="text-center py-8">Đang tải...</div>

  if (isAuthenticated) {
    return children
  }

  return (
    <>
      {/* Show some content or a message */}
      <div className="text-center py-8 text-gray-500">
        <p>Vui lòng đăng nhập để xem trang này</p>
      </div>
      
      {/* Show login modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}
