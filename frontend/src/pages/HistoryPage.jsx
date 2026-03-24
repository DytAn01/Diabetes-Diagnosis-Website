import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import { ChevronDown, ChevronUp, Copy, Trash2, Activity } from 'lucide-react'

export default function HistoryPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

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
    if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
      try {
        await axiosClient.delete(`/records/${recordId}`)
        setRecords(records.filter(r => r.id !== recordId))
      } catch (err) {
        setError('Không thể xóa bản ghi')
      }
    }
  }

  const handleCopyData = (record) => {
    const formData = {
      pregnancies: record.pregnancies,
      glucose: record.glucose,
      blood_pressure: record.blood_pressure,
      skin_thickness: record.skin_thickness,
      insulin: record.insulin,
      bmi: record.bmi,
      diabetes_pedigree: record.diabetes_pedigree,
      age: record.age
    }
    localStorage.setItem('diagnosisFormData', JSON.stringify(formData))
    setCopiedId(record.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) return <div className="text-center py-8">Đang tải lịch sử...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Lịch sử Chẩn đoán</h1>
          <p className="text-gray-600">Xem chi tiết các lần chẩn đoán của bạn</p>
        </div>
        <Link 
          to="/tracker" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Activity className="w-5 h-5" />
          Health Tracker
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4 text-lg">Chưa có bản ghi chẩn đoán nào</p>
          <a href="/diagnosis" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Tạo chẩn đoán đầu tiên
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => {
            const riskScore = record.risk_score ?? record.probability ?? 0
            const riskLevel = record.risk_level || (record.prediction === 1 ? 'high' : 'low')
            const isHighRisk = riskLevel === 'high' || record.prediction === 1
            const isExpanded = expandedId === record.id
            const isCopied = copiedId === record.id

            return (
              <div 
                key={record.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                  isHighRisk ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
                }`}
              >
                {/* Header - Always Visible */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full p-6 hover:bg-gray-50 transition-colors flex justify-between items-start cursor-pointer"
                >
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {isHighRisk ? '⚠️' : '✅'}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">
                          {isHighRisk ? 'Nguy cơ Cao' : 'Nguy cơ Thấp'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      {(riskScore * 100).toFixed(1)}%
                    </p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyData(record)
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                          isCopied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                        title="Sao chép dữ liệu để tái chẩn đoán"
                      >
                        <Copy size={16} />
                        {isCopied ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(record.id)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Xóa bản ghi"
                      >
                        <Trash2 size={16} />
                      </button>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-6 space-y-6">
                    {/* Quick Stats */}
                    <div>
                      <h4 className="font-bold text-gray-700 mb-4">📊 Các chỉ số Cơ bản</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600 font-semibold">GLUCOSE</p>
                          <p className="text-2xl font-bold text-blue-600">{record.glucose ?? '-'}</p>
                          <p className="text-xs text-gray-500">mg/dL</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600 font-semibold">HUYẾT ÁP</p>
                          <p className="text-2xl font-bold text-blue-600">{record.blood_pressure ?? '-'}</p>
                          <p className="text-xs text-gray-500">mmHg</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600 font-semibold">BMI</p>
                          <p className="text-2xl font-bold text-blue-600">{(record.bmi ?? 0).toFixed(1)}</p>
                          <p className="text-xs text-gray-500">kg/m²</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-600 font-semibold">TUỔI</p>
                          <p className="text-2xl font-bold text-blue-600">{record.age ?? '-'}</p>
                          <p className="text-xs text-gray-500">năm</p>
                        </div>
                      </div>
                    </div>

                    {/* All Biomarkers */}
                    <div>
                      <h4 className="font-bold text-gray-700 mb-4">🔬 Tất cả Chỉ số Sinh học</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-4 rounded-lg border-l-2 border-purple-400">
                          <p className="text-xs text-gray-600 font-semibold">Lần Mang Thai</p>
                          <p className="text-xl font-bold text-purple-600">{record.pregnancies ?? '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-blue-400">
                          <p className="text-xs text-gray-600 font-semibold">Glucose</p>
                          <p className="text-xl font-bold text-blue-600">{record.glucose ?? '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-red-400">
                          <p className="text-xs text-gray-600 font-semibold">Huyết áp</p>
                          <p className="text-xl font-bold text-red-600">{record.blood_pressure ?? '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-orange-400">
                          <p className="text-xs text-gray-600 font-semibold">Độ Dày Nếp Da</p>
                          <p className="text-xl font-bold text-orange-600">{record.skin_thickness ?? '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-green-400">
                          <p className="text-xs text-gray-600 font-semibold">Insulin</p>
                          <p className="text-xl font-bold text-green-600">{record.insulin ?? '-'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-indigo-400">
                          <p className="text-xs text-gray-600 font-semibold">BMI</p>
                          <p className="text-xl font-bold text-indigo-600">{(record.bmi ?? 0).toFixed(1)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-pink-400">
                          <p className="text-xs text-gray-600 font-semibold">Hệ số Phả Hệ</p>
                          <p className="text-xl font-bold text-pink-600">{(record.diabetes_pedigree ?? 0).toFixed(3)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-2 border-teal-400">
                          <p className="text-xs text-gray-600 font-semibold">Tuổi</p>
                          <p className="text-xl font-bold text-teal-600">{record.age ?? '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div>
                      <h4 className="font-bold text-gray-700 mb-4">
                        {isHighRisk ? '⚠️ Đánh giá Nguy cơ Cao' : '✅ Đánh giá Nguy cơ Thấp'}
                      </h4>
                      <div className={`p-4 rounded-lg ${
                        isHighRisk 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {isHighRisk 
                            ? 'Dựa trên các chỉ số sinh học của bạn, mô hình dự đoán cho thấy nguy cơ cao mắc bệnh tiểu đường. Khuyến nghị bạn nên tham khảo bác sĩ chuyên khoa và thực hiện các xét nghiệm y tế sàng lọc tiểu đường.'
                            : 'Dựa trên các chỉ số sinh học của bạn, mô hình dự đoán cho thấy nguy cơ thấp mắc bệnh tiểu đường. Tuy nhiên, vẫn nên duy trì lối sống lành mạnh để phòng ngừa bệnh.'
                          }
                        </p>
                        <p className="text-sm font-semibold mt-3 text-gray-700">
                          Độ tin cậy dự đoán: <span className="text-blue-600">{(riskScore * 100).toFixed(1)}%</span>
                        </p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {isHighRisk && (
                      <div>
                        <h4 className="font-bold text-gray-700 mb-4">🏥 Khuyến nghị Hành động</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3">
                            <span className="text-red-500 text-lg">•</span>
                            <span className="text-sm text-gray-700">Lên lịch khám với bác sĩ nội tiết hoặc bác sĩ gia đình</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-red-500 text-lg">•</span>
                            <span className="text-sm text-gray-700">Thực hiện xét nghiệm sàng lọc tiểu đường (Glucose máu, HbA1c)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-red-500 text-lg">•</span>
                            <span className="text-sm text-gray-700">Tăng hoạt động thể chất (ít nhất 150 phút/tuần)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-red-500 text-lg">•</span>
                            <span className="text-sm text-gray-700">Cải thiện chế độ ăn uống (giảm đường, tăng chất xơ)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-red-500 text-lg">•</span>
                            <span className="text-sm text-gray-700">Duy trì cân nặng lành mạnh</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
