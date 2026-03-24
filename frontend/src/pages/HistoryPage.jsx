// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { 
//   History as HistoryIcon, 
//   Trash2, 
//   Calendar, 
//   Activity, 
//   ChevronRight, 
//   Search,
//   AlertCircle,
//   Clock,
//   ClipboardList
// } from 'lucide-react'
// import axiosClient from '../api/axiosClient'
// import { X } from 'lucide-react'

// export default function HistoryPage() {
//   const [records, setRecords] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedRecord, setSelectedRecord] = useState(null)

//   useEffect(() => {
//     fetchRecords()
//   }, [])

//   const fetchRecords = async () => {
//     try {
//       const response = await axiosClient.get('/records/')
//       // The API returns { records: [...] }
//       setRecords(response.data.records || [])
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to fetch clinical records')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDelete = async (recordId) => {
//     if (!window.confirm('Are you sure you want to permanently delete this clinical record?')) return
//     try {
//       await axiosClient.delete(`/records/${recordId}`)
//       setRecords(records.filter(r => r.id !== recordId))
//     } catch (err) {
//       setError('System failure: Could not delete record')
//     }
//   }

//   const filteredRecords = records.filter(r => 
//     r.id.toString().includes(searchTerm) || 
//     (r.note && r.note.toLowerCase().includes(searchTerm.toLowerCase()))
//   )

//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto space-y-12 pb-20">
//         <div className="h-40 bg-slate-100 rounded-[40px] animate-pulse" />
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {[1, 2, 3].map(i => (
//             <div key={i} className="h-64 bg-slate-50 rounded-[40px] animate-pulse" />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-6xl mx-auto space-y-12 pb-20"
//     >
//       {/* Header */}
//       <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//         <div className="space-y-2">
//           <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
//             <Clock size={10} /> Dữ liệu theo thời gian
//           </div>
//           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Lưu trữ lâm sàng</h1>
//           <p className="text-lg text-slate-500 font-medium">Xem và quản lý các đánh giá sức khỏe trong quá khứ.</p>
//         </div>
        
//         <div className="flex items-center gap-3">
//            <div className="relative group">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
//               <input 
//                 type="text" 
//                 placeholder="Tìm theo ID hoặc Ghi chú..." 
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-11 pr-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-teal-500/20 focus:ring-8 focus:ring-teal-500/5 transition-all outline-none"
//               />
//            </div>
//         </div>
//       </header>

//       {error && (
//         <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-4 text-red-600">
//           <AlertCircle size={20} />
//           <p className="font-bold">{error}</p>
//         </div>
//       )}

//       {records.length === 0 ? (
//         <div className="glass-card p-20 rounded-[48px] text-center space-y-6">
//           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
//              <HistoryIcon size={40} />
//           </div>
//           <div className="space-y-4">
//             <h3 className="text-2xl font-black text-slate-900">Không tìm thấy bản ghi</h3>
//             <p className="text-slate-500 font-medium italic">Lịch sử chẩn đoán của bạn hiện đang trống.</p>
//             <div className="pt-4">
//               <a href="/diagnosis" className="inline-flex items-center gap-2 bg-teal-500 text-slate-900 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-1">
//                  Bắt đầu chẩn đoán đầu tiên <ChevronRight size={16} />
//               </a>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           <AnimatePresence>
//             {filteredRecords.map((record, idx) => {
//               const riskLevel = record.risk_level || (record.prediction === 1 ? 'high' : 'low')
//               const isHighRisk = riskLevel === 'high' || record.prediction === 1
//               const riskScore = record.risk_score ?? record.probability ?? 0

//               return (
//                 <motion.div
//                   key={record.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ delay: idx * 0.05 }}
//                   className="group relative"
//                 >
//                   <div className="glass-card p-8 rounded-[40px] border-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
//                     {/* Status Indicator */}
//                     <div className="flex items-center justify-between mb-6">
//                       <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${
//                         isHighRisk 
//                           ? 'bg-red-50 text-red-600 border-red-100' 
//                           : riskLevel === 'medium'
//                           ? 'bg-amber-50 text-amber-600 border-amber-100'
//                           : 'bg-teal-50 text-teal-600 border-teal-100'
//                       }`}>
//                         {isHighRisk ? 'Nguy cơ cao' : riskLevel === 'medium' ? 'Nguy cơ vừa' : 'Nguy cơ thấp'}
//                       </div>
//                       <button 
//                         onClick={() => handleDelete(record.id)}
//                         className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>

//                     {/* Date & Title */}
//                     <div className="space-y-1 mb-8">
//                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
//                          <Calendar size={12} /> {new Date(record.created_at).toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
//                        </div>
//                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Phân tích chẩn đoán</h3>
//                     </div>

//                     {/* Probability Gauge */}
//                     <div className="mb-8 p-4 bg-slate-900/5 rounded-3xl border border-white/50 backdrop-blur-sm">
//                        <div className="flex items-center justify-between mb-2">
//                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Xác suất nguy cơ</span>
//                           <span className={`text-sm font-black ${isHighRisk ? 'text-red-500' : 'text-teal-500'}`}>
//                              {(riskScore * 100).toFixed(1)}%
//                           </span>
//                        </div>
//                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
//                           <motion.div 
//                             initial={{ width: 0 }}
//                             animate={{ width: `${riskScore * 100}%` }}
//                             transition={{ duration: 1, delay: 0.2 }}
//                             className={`h-full ${isHighRisk ? 'bg-red-500' : 'bg-teal-500'}`}
//                           />
//                        </div>
//                     </div>

//                     {/* Metrics Peek */}
//                     <div className="grid grid-cols-2 gap-3 mb-8">
//                       <div className="p-3 bg-white/50 rounded-2xl border border-slate-100/50">
//                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Glucose</p>
//                          <p className="text-sm font-black text-slate-900">{record.glucose ?? '-'}</p>
//                       </div>
//                       <div className="p-3 bg-white/50 rounded-2xl border border-slate-100/50">
//                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">BMI</p>
//                          <p className="text-sm font-black text-slate-900">{record.bmi ?? '-'}</p>
//                       </div>
//                     </div>

//                     {/* Footer Action */}
//                     <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
//                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bản ghi #{record.id.toString().slice(-6)}</span>
//                         <div
//                           role="button"
//                           tabIndex={0}
//                           onClick={() => setSelectedRecord(record)}
//                           onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRecord(record) }}
//                           className="flex items-center gap-1 text-teal-600 text-[10px] font-black uppercase tracking-widest hover:gap-2 transition-all cursor-pointer"
//                         >
//                           Chi tiết <ChevronRight size={12} />
//                         </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               )
//             })}
//           </AnimatePresence>
//         </div>
//       )}

//       {/* Detail modal */}
//       <AnimatePresence>
//         {selectedRecord && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-60 flex items-center justify-center p-6"
//           >
//             <div
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               onClick={() => setSelectedRecord(null)}
//             />

//             <motion.div
//               initial={{ y: 20, scale: 0.98 }}
//               animate={{ y: 0, scale: 1 }}
//               exit={{ y: 20, opacity: 0 }}
//               transition={{ duration: 0.25 }}
//               className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-6 z-50"
//               role="dialog"
//               aria-modal="true"
//             >
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <h3 className="text-2xl font-extrabold text-slate-900">Chi tiết bản ghi #{selectedRecord.id}</h3>
//                   <p className="text-sm text-slate-500 mt-1">{new Date(selectedRecord.created_at).toLocaleString('vi-VN')}</p>
//                 </div>
//                 <button
//                   onClick={() => setSelectedRecord(null)}
//                   aria-label="Đóng"
//                   className="p-2 rounded-md text-slate-500 hover:bg-slate-100 transition"
//                 >
//                   <X size={18} />
//                 </button>
//               </div>

//               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="md:col-span-2 space-y-4">
//                   <div className="p-4 bg-slate-50 rounded-xl border">
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs font-black uppercase tracking-widest text-slate-400">Xác suất nguy cơ</span>
//                       <span className={`text-sm font-black ${ (selectedRecord.risk_level === 'high' || selectedRecord.prediction === 1) ? 'text-red-500' : 'text-teal-500' }`}>{((selectedRecord.risk_score ?? selectedRecord.probability ?? 0) * 100).toFixed(1)}%</span>
//                     </div>
//                     <div className="mt-3 h-3 w-full bg-slate-200 rounded-full overflow-hidden">
//                       <motion.div
//                         initial={{ width: 0 }}
//                         animate={{ width: `${(selectedRecord.risk_score ?? selectedRecord.probability ?? 0) * 100}%` }}
//                         transition={{ duration: 0.8 }}
//                         className={`h-full ${ (selectedRecord.risk_level === 'high' || selectedRecord.prediction === 1) ? 'bg-red-500' : 'bg-teal-500' }`}
//                       />
//                     </div>
//                   </div>

//                   <div className="p-4 bg-white rounded-xl border">
//                     <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Ghi chú</h4>
//                     <p className="mt-2 text-sm text-slate-600">{selectedRecord.note || 'Không có ghi chú.'}</p>
//                   </div>

//                   <div className="p-4 bg-white rounded-xl border">
//                     <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Chi tiết</h4>
//                     <div className="mt-3 grid grid-cols-2 gap-3">
//                       <div className="p-3 bg-slate-50 rounded-lg">
//                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Glucose</p>
//                         <p className="text-sm font-black text-slate-900">{selectedRecord.glucose ?? '-'}</p>
//                       </div>
//                       <div className="p-3 bg-slate-50 rounded-lg">
//                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BMI</p>
//                         <p className="text-sm font-black text-slate-900">{selectedRecord.bmi ?? '-'}</p>
//                       </div>
//                       <div className="p-3 bg-slate-50 rounded-lg">
//                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tuổi</p>
//                         <p className="text-sm font-black text-slate-900">{selectedRecord.age ?? '-'}</p>
//                       </div>
//                       <div className="p-3 bg-slate-50 rounded-lg">
//                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Huyết áp</p>
//                         <p className="text-sm font-black text-slate-900">{selectedRecord.blood_pressure ?? '-'}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <aside className="hidden md:block p-4 bg-white/50 rounded-xl border h-full">
//                   <div className="space-y-3">
//                     <div>
//                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
//                       <div className="mt-2 px-3 py-1 rounded-full text-sm font-black inline-block">
//                         {(selectedRecord.risk_level === 'high' || selectedRecord.prediction === 1) ? (
//                           <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full">Nguy cơ cao</span>
//                         ) : selectedRecord.risk_level === 'medium' ? (
//                           <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full">Nguy cơ vừa</span>
//                         ) : (
//                           <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full">Nguy cơ thấp</span>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lưu ý</p>
//                       <p className="mt-2 text-sm text-slate-600">Sử dụng thông tin này để tham khảo; không thay thế chẩn đoán chuyên môn.</p>
//                     </div>

//                     <div>
//                       <button onClick={() => setSelectedRecord(null)} className="w-full px-4 py-2 bg-teal-600 text-white rounded-md font-bold">Đóng</button>
//                     </div>
//                   </div>
//                 </aside>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   )
// }
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