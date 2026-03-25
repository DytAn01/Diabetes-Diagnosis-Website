import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axiosClient from '../api/axiosClient'
import { ChevronDown, Copy, Trash2, Activity, Calendar, AlertCircle } from 'lucide-react'

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

  if (loading) return <div className="text-center py-8 text-slate-500">Đang tải lịch sử...</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-12 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 mb-4">
              <Calendar size={12} /> Lịch sử chẩn đoán
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Lịch sử Chẩn đoán
            </h1>
            <p className="text-slate-500 font-medium text-lg">Xem chi tiết các lần chẩn đoán của bạn</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to="/tracker" 
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg shadow-teal-500/20"
            >
              <Activity className="w-5 h-5" />
              Theo dõi Sức khỏe
            </Link>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {records.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-16 rounded-[40px] text-center space-y-6"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-10 h-10 text-slate-300" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Chưa có bản ghi chẩn đoán</h3>
              <p className="text-slate-500 font-medium mt-2">Bạn chưa thực hiện lần chẩn đoán nào</p>
            </div>
            <Link 
              to="/diagnosis" 
              className="inline-block bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-3 rounded-2xl font-bold hover:from-teal-700 hover:to-cyan-700 transition"
            >
              Bắt đầu chẩn đoán đầu tiên
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {records.map((record, idx) => {
                const riskScore = record.risk_score ?? record.probability ?? 0
                const riskLevel = record.risk_level || (record.prediction === 1 ? 'high' : 'low')
                const isHighRisk = riskLevel === 'high' || record.prediction === 1
                const isExpanded = expandedId === record.id
                const isCopied = copiedId === record.id

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                  >
                    <div className="glass-card rounded-[28px] overflow-hidden border-white/50 hover:shadow-xl transition-all">
                      {/* Header */}
                      <motion.div
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        className="p-6 cursor-pointer hover:bg-white/30 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                                isHighRisk ? 'bg-red-50' : 'bg-teal-50'
                              }`}>
                                {isHighRisk ? '⚠️' : '✅'}
                              </div>
                              <div>
                                <h3 className={`text-xl font-black ${
                                  isHighRisk ? 'text-red-600' : 'text-teal-600'
                                }`} style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                                  {isHighRisk ? 'Nguy cơ Cao' : 'Nguy cơ Thấp'}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                  <Calendar size={14} />
                                  {new Date(record.created_at).toLocaleDateString('vi-VN', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-3">
                            <div>
                              <p className={`text-3xl font-black ${
                                isHighRisk ? 'text-red-600' : 'text-teal-600'
                              }`}>
                                {(riskScore * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-400 font-semibold mt-1">Xác suất nguy cơ</p>
                            </div>

                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyData(record)
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                                  isCopied
                                    ? 'bg-teal-100 text-teal-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <Copy size={14} />
                                {isCopied ? 'Sao chép' : 'Copy'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(record.id)
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                              </motion.button>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                className="pl-2"
                              >
                                <ChevronDown size={20} className="text-slate-400" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-white/50 bg-white/20 backdrop-blur-sm"
                          >
                            <div className="p-8 space-y-8">
                              {/* Quick Stats */}
                              <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600 mb-4">📊 Chỉ số Cơ bản</h4>
                                <motion.div
                                  layout
                                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                >
                                  {[
                                    { label: 'Glucose', value: record.glucose, unit: 'mg/dL', color: 'from-blue-500 to-cyan-400' },
                                    { label: 'Huyết áp', value: record.blood_pressure, unit: 'mmHg', color: 'from-red-500 to-rose-400' },
                                    { label: 'BMI', value: record.bmi, unit: 'kg/m²', color: 'from-emerald-500 to-teal-400', format: 1 },
                                    { label: 'Tuổi', value: record.age, unit: 'năm', color: 'from-violet-500 to-purple-400' }
                                  ].map((item) => (
                                    <motion.div
                                      key={item.label}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`glass-card p-4 rounded-2xl`}
                                    >
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                                      <p className={`text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                        {item.value ?? '-'}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-1">{item.unit}</p>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              </div>

                              {/* All Biomarkers */}
                              <div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600 mb-4">🔬 Tất cả Chỉ số Sinh học</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {[
                                    { label: 'Insulin', value: record.insulin, color: 'from-green-500 to-emerald-400' },
                                    { label: 'Skin Thickness', value: record.skin_thickness, color: 'from-orange-500 to-amber-400' },
                                    { label: 'Pregnancies', value: record.pregnancies, color: 'from-pink-500 to-rose-400' },
                                    { label: 'Pedigree', value: record.diabetes_pedigree, format: 3, color: 'from-indigo-500 to-blue-400' }
                                  ].map((item) => (
                                    <motion.div
                                      key={item.label}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="glass-card p-3 rounded-[20px] border border-white/30"
                                    >
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                                      <p className={`text-lg font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                        {item.value ? (item.format ? item.value.toFixed(item.format) : Math.round(item.value)) : '-'}
                                      </p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Risk Assessment */}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`glass-card p-6 rounded-[24px] border-2 ${
                                  isHighRisk
                                    ? 'border-red-200/50 bg-red-50/20'
                                    : 'border-teal-200/50 bg-teal-50/20'
                                }`}
                              >
                                <h4 className={`text-sm font-black uppercase tracking-widest mb-3 ${
                                  isHighRisk ? 'text-red-600' : 'text-teal-600'
                                }`}>
                                  {isHighRisk ? '⚠️ Đánh giá Nguy cơ Cao' : '✅ Đánh giá Nguy cơ Thấp'}
                                </h4>
                                <p className="text-slate-700 leading-relaxed font-medium text-sm">
                                  {isHighRisk
                                    ? 'Dựa trên các chỉ số sinh học của bạn, mô hình dự đoán cho thấy nguy cơ cao mắc bệnh tiểu đường. Khuyến nghị bạn nên tham khảo bác sĩ chuyên khoa.'
                                    : 'Dựa trên các chỉ số sinh học của bạn, mô hình dự đoán cho thấy nguy cơ thấp mắc bệnh tiểu đường.'
                                  }
                                </p>
                              </motion.div>

                              {/* Note */}
                              {record.note && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="glass-card p-6 rounded-[24px] border-2 border-cyan-200/50 bg-cyan-50/20"
                                >
                                  <h4 className="text-sm font-black uppercase tracking-widest text-cyan-600 mb-3">📝 Ghi chú</h4>
                                  <p className="text-slate-700 font-medium text-sm">{record.note}</p>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}
