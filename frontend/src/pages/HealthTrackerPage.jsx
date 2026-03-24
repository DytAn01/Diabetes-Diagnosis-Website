import HealthTracker from '../components/HealthTracker'
import { Activity } from 'lucide-react'

function HealthTrackerPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Health Tracker</h1>
        </div>
        <p className="text-lg text-gray-600">
          Monitor your health metrics over time and track your progress towards better health.
        </p>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">💡 Regular Tracking</h3>
          <p className="text-sm text-green-800">Record your health metrics weekly or monthly to see clear trends.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Trend Analysis</h3>
          <p className="text-sm text-blue-800">Charts show whether your health is improving, stable, or worsening.</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">🎯 Goal Setting</h3>
          <p className="text-sm text-purple-800">Use historical data to set realistic health improvement goals.</p>
        </div>
      </div>

      {/* Health Tracker Component */}
      <HealthTracker />
    </div>
  )
}

export default HealthTrackerPage
