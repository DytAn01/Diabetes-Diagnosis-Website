import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingChatBubble from './components/FloatingChatBubble'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DiagnosisPage from './pages/DiagnosisPage'
import ResultPage from './pages/ResultPage'
import HistoryPage from './pages/HistoryPage'
import ArticlesPage from './pages/ArticlesPage'
import HealthTrackerPage from './pages/HealthTrackerPage'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path='/tracker' element={<HealthTrackerPage />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/diagnosis" 
                  element={<PrivateRoute><DiagnosisPage /></PrivateRoute>} 
                />
                <Route 
                  path="/result" 
                  element={<PrivateRoute><ResultPage /></PrivateRoute>} 
                />
                <Route 
                  path="/history" 
                  element={<PrivateRoute><HistoryPage /></PrivateRoute>} 
                />
                <Route 
                  path="/tracker" 
                  element={<PrivateRoute><HealthTrackerPage /></PrivateRoute>} 
                />
              </Routes>
            </main>
            <Footer />
            {/* Floating Chat Bubble - persists across all pages */}
            <FloatingChatBubble />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
