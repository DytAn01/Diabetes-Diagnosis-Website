import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Diabetes Risk Assessment</h1>
        <p className="text-xl mb-8">
          Early detection can save lives. Get your risk assessment today.
        </p>
        {isAuthenticated ? (
          <Link 
            to="/diagnosis" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Start Diagnosis
          </Link>
        ) : (
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Get Started
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">🔬 Advanced ML Model</h3>
          <p>Uses machine learning to predict diabetes risk with high accuracy.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">📊 Health History</h3>
          <p>Track your diagnoses over time and monitor your health progress.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">📚 Health Articles</h3>
          <p>Access curated health articles and educational resources.</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About This Application</h2>
        <p className="text-gray-700 mb-4">
          This diabetes diagnosis application uses a trained machine learning model
          based on the PIMA Indians Diabetes Dataset to assess your risk of developing diabetes.
        </p>
        <p className="text-gray-700">
          The app analyzes medical indicators including glucose levels, blood pressure, BMI,
          and other health metrics to provide a risk assessment. Always consult with a 
          healthcare professional for medical advice.
        </p>
      </div>
    </div>
  )
}
