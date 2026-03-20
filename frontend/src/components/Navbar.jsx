import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🏥 Diabetes Diagnosis
        </Link>
        <div className="flex gap-6">
          <Link to="/articles" className="hover:bg-blue-700 px-3 py-2 rounded">
            Articles
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/diagnosis" className="hover:bg-blue-700 px-3 py-2 rounded">
                Diagnosis
              </Link>
              <Link to="/history" className="hover:bg-blue-700 px-3 py-2 rounded">
                History
              </Link>
              <button 
                onClick={logout}
                className="hover:bg-blue-700 px-3 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">
                Login
              </Link>
              <Link to="/register" className="hover:bg-blue-700 px-3 py-2 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
