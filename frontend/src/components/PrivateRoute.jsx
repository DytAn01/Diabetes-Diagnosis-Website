import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div>Đang tải...</div>

  return isAuthenticated ? children : <Navigate to="/login" />
}
