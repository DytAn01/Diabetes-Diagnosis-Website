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
      <div className="glass-card rounded-[32px] p-12 flex items-center justify-center min-h-[260px] border-white/70">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu theo dõi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card border-2 border-red-200/70 rounded-[32px] p-8 text-center bg-red-50/40">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={fetchTrackerData}
          className="mt-5 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (!trackerData || trackerData.total_records === 0) {
    return (
      <div className="glass-card border-2 border-blue-200/70 rounded-[32px] p-12 text-center bg-blue-50/40">
        <Activity className="w-16 h-16 mx-auto text-blue-400 mb-4" />
        <h3 className="text-2xl font-black text-blue-900 mb-2">Chưa có lịch sử chẩn đoán</h3>
        <p className="text-blue-700 mb-6 font-medium">
          Bạn chưa thực hiện bất kỳ chẩn đoán nào. Hãy bắt đầu với lần chẩn đoán đầu tiên để theo dõi sức khỏe của bạn.
        </p>
        <a
          href="/diagnosis"
          className="inline-block px-7 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-black rounded-2xl hover:from-teal-700 hover:to-cyan-700 transition"
        >
          Bắt đầu chẩn đoán ngay
        </a>
      </div>
    )
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#334155',
          font: {
            family: 'Be Vietnam Pro',
            weight: 600
          }
        }
      },
      title: {
        display: true,
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: 'rgba(15, 23, 42, 0.08)'
        }
      },
      x: {
        ticks: {
          color: '#64748b'
        },
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
    <div className="glass-card border-white/60 rounded-[24px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-black text-slate-700 uppercase tracking-wide text-sm">{metric}</h4>
        {getTrendIcon(stats.trend)}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Hiện tại</p>
          <p className="text-3xl font-black text-slate-900 leading-tight">
            {stats.current?.toFixed(1) || 'N/A'} <span className="text-sm text-slate-500">{unit}</span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/70">
          <div>
            <p className="text-[11px] text-slate-500">TB</p>
            <p className="text-sm font-bold text-slate-700">{stats.avg?.toFixed(1) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Min</p>
            <p className="text-sm font-bold text-slate-700">{stats.min?.toFixed(1) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Max</p>
            <p className="text-sm font-bold text-slate-700">{stats.max?.toFixed(1) || 'N/A'}</p>
          </div>
        </div>
        <div className={`text-sm font-bold pt-1 ${getTrendColor(stats.trend)}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-[28px] border-white/60 p-6">
          <h3 className="text-lg font-black mb-4 text-slate-900">Xu hướng Glucose</h3>
          <Line data={glucoseChart} options={chartOptions} />
        </div>

        <div className="glass-card rounded-[28px] border-white/60 p-6">
          <h3 className="text-lg font-black mb-4 text-slate-900">Xu hướng BMI</h3>
          <Line data={bmiChart} options={chartOptions} />
        </div>

        <div className="glass-card rounded-[28px] border-white/60 p-6">
          <h3 className="text-lg font-black mb-4 text-slate-900">Xu hướng Huyết áp</h3>
          <Line data={bloodPressureChart} options={chartOptions} />
        </div>

        <div className="glass-card rounded-[28px] border-white/60 p-6">
          <h3 className="text-lg font-black mb-4 text-slate-900">Xu hướng Insulin</h3>
          <Line data={insulinChart} options={chartOptions} />
        </div>

        <div className="glass-card rounded-[28px] border-white/60 p-6 lg:col-span-2">
          <h3 className="text-lg font-black mb-4 text-slate-900">Xu hướng Điểm rủi ro</h3>
          <Line data={riskScoreChart} options={chartOptions} />
        </div>
      </div>

      <div className="glass-card rounded-[24px] border border-teal-100 bg-teal-50/50 p-5">
        <p className="text-teal-900 font-medium">
          📊 <strong>{trackerData.total_records}</strong> bản ghi sức khỏe được theo dõi. 
          Tiếp tục ghi lại các chỉ số sức khỏe của bạn thường xuyên để theo dõi tiến độ.
        </p>
      </div>
    </div>
  )
}

export default HealthTracker
