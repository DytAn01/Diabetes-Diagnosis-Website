import { useLocation, Link } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'

export default function ResultPage() {
  const location = useLocation()
  const { prediction, probability, message } = location.state || {}

  if (prediction === undefined) {
    return (
      <div className="text-center">
        <p className="text-gray-600 mb-4">No diagnosis data available</p>
        <Link to="/diagnosis" className="text-blue-600 hover:underline">
          Go back to diagnosis form
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Diagnosis Results</h1>

      <RiskBadge prediction={prediction} probability={probability} />

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Result Summary</h2>
        <p className="text-lg text-gray-700 mb-4">{message}</p>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">⚠️ Important Notice</h3>
          <p className="text-gray-700">
            This prediction is based on a machine learning model and should not be 
            considered as a medical diagnosis. Please consult with a healthcare 
            professional for accurate medical assessment and treatment.
          </p>
        </div>

        {prediction === 1 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-red-700 mb-2">🏥 Recommended Actions</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Schedule an appointment with your doctor</li>
              <li>• Get a proper diabetes screening test</li>
              <li>• Learn about diabetes prevention and management</li>
              <li>• Monitor your blood sugar regularly</li>
            </ul>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-green-700 mb-2">💪 Health Tips</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Maintain a healthy diet with balanced nutrients</li>
            <li>• Exercise regularly for at least 150 minutes per week</li>
            <li>• Maintain a healthy weight</li>
            <li>• Regular health checkups</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex gap-4 justify-center">
        <Link 
          to="/history" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          View History
        </Link>
        <Link 
          to="/diagnosis" 
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          New Diagnosis
        </Link>
      </div>
    </div>
  )
}
