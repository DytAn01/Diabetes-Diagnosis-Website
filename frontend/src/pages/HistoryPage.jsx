import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export default function HistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await axiosClient.get('/records/')
      setRecords(response.data.records)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axiosClient.delete(`/records/${recordId}`)
        setRecords(records.filter(r => r.id !== recordId))
      } catch (err) {
        setError('Failed to delete record')
      }
    }
  }

  if (loading) return <div className="text-center">Đang tải...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Lịch sử Chẩn đoán</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy bản ghi chẩn đoán</p>
          <a href="/diagnosis" className="text-blue-600 hover:underline">
            Tạo chẩn đoán đầu tiên của bạn
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            (() => {
              const riskScore = record.risk_score ?? record.probability ?? 0
              const riskLevel = record.risk_level || (record.prediction === 1 ? 'high' : 'low')
              const isHighRisk = riskLevel === 'high' || record.prediction === 1

              return (
            <div 
              key={record.id} 
              className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${
                isHighRisk ? 'border-red-500' : riskLevel === 'medium' ? 'border-yellow-500' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">
                    {riskLevel === 'high' ? '⚠️ Nguy cơ Cao' : riskLevel === 'medium' ? '🟡 Nguy cơ Trung bình' : '✅ Nguy cơ Thấp'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {(riskScore * 100).toFixed(1)}%
                  </p>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:text-red-800 text-sm mt-2"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Glucose</p>
                  <p className="font-bold">{record.glucose ?? '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Huyết áp</p>
                  <p className="font-bold">{record.blood_pressure ?? '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">BMI</p>
                  <p className="font-bold">{record.bmi ?? '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tuổi</p>
                  <p className="font-bold">{record.age ?? '-'}</p>
                </div>
              </div>
            </div>
              )
            })()
          ))}
        </div>
      )}
    </div>
  )
}
