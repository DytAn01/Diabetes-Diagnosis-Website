import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import axiosClient from '../api/axiosClient'
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function HealthTracker() {
  const [trackerData, setTrackerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrackerData()
  }, [])

  const fetchTrackerData = async () => {
    try {
      setLoading(true)
      const response = await axiosClient.get('/records/tracker/stats')
      setTrackerData(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Không tải được dữ liệu theo dõi sức khỏe')
      setTrackerData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchTrackerData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!trackerData) {
    return null
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const getTrendIcon = (trend) => {
    if (trend === 'improving') {
      return <TrendingDown className="w-5 h-5 text-green-500" />
    } else if (trend === 'worsening') {
      return <TrendingUp className="w-5 h-5 text-red-500" />
    }
    return <Activity className="w-5 h-5 text-gray-500" />
  }

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-green-600'
    if (trend === 'worsening') return 'text-red-600'
    return 'text-gray-600'
  }

  const StatCard = ({ metric, stats, unit }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-700">{metric}</h4>
        {getTrendIcon(stats.trend)}
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500">Hiện tại</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.current?.toFixed(1) || 'N/A'} <span className="text-sm text-gray-600">{unit}</span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div>
            <p className="text-xs text-gray-500">Trung bình</p>
            <p className="text-sm font-semibold text-gray-700">{stats.avg?.toFixed(1) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tối thiểu</p>
            <p className="text-sm font-semibold text-gray-700">{stats.min?.toFixed(1) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tối đa</p>
            <p className="text-sm font-semibold text-gray-700">{stats.max?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>
        <div className={`text-sm font-medium pt-2 ${getTrendColor(stats.trend)}`}>
          {stats.trend === 'improving' && '📈 Đang cải thiện'}
          {stats.trend === 'worsening' && '📉 Đang xấu đi'}
          {stats.trend === 'stable' && '➡️ Ổn định'}
        </div>
      </div>
    </div>
  )

  // Glucose Chart
  const glucoseChart = {
    labels: trackerData.dates,
    datasets: [
      {
        label: 'Glucose (mg/dL)',
        data: trackerData.glucose.data,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  // BMI Chart
  const bmiChart = {
    labels: trackerData.dates,
    datasets: [
      {
        label: 'BMI (kg/m²)',
        data: trackerData.bmi.data,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  // Blood Pressure Chart
  const bloodPressureChart = {
    labels: trackerData.dates,
    datasets: [
      {
        label: 'Huyết áp (mmHg)',
        data: trackerData.blood_pressure.data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  // Insulin Chart
  const insulinChart = {
    labels: trackerData.dates,
    datasets: [
      {
        label: 'Insulin (µU/ml)',
        data: trackerData.insulin.data,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  // Risk Score Chart
  const riskScoreChart = {
    labels: trackerData.dates,
    datasets: [
      {
        label: 'Điểm rủi ro',
        data: trackerData.risk_score.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          metric="Glucose" 
          stats={trackerData.glucose.stats}
          unit={trackerData.glucose.unit}
        />
        <StatCard 
          metric="BMI" 
          stats={trackerData.bmi.stats}
          unit={trackerData.bmi.unit}
        />
        <StatCard 
          metric="Huyết áp" 
          stats={trackerData.blood_pressure.stats}
          unit={trackerData.blood_pressure.unit}
        />
        <StatCard 
          metric="Insulin" 
          stats={trackerData.insulin.stats}
          unit={trackerData.insulin.unit}
        />
        <StatCard 
          metric="Điểm rủi ro" 
          stats={trackerData.risk_score.stats}
          unit={trackerData.risk_score.unit}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Glucose Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Xu hướng Glucose</h3>
          <Line data={glucoseChart} options={chartOptions} />
        </div>

        {/* BMI Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Xu hướng BMI</h3>
          <Line data={bmiChart} options={chartOptions} />
        </div>

        {/* Blood Pressure Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Xu hướng Huyết áp</h3>
          <Line data={bloodPressureChart} options={chartOptions} />
        </div>

        {/* Insulin Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Xu hướng Insulin</h3>
          <Line data={insulinChart} options={chartOptions} />
        </div>

        {/* Risk Score Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Xu hướng Điểm rủi ro</h3>
          <Line data={riskScoreChart} options={chartOptions} />
        </div>
      </div>

      {/* Records Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          📊 <strong>{trackerData.total_records}</strong> bản ghi sức khỏe được theo dõi. 
          Tiếp tục ghi lại các chỉ số sức khỏe của bạn thường xuyên để theo dõi tiến độ.
        </p>
      </div>
    </div>
  )
}

export default HealthTracker
