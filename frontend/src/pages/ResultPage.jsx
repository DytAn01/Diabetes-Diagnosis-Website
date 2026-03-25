import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Heart, MessageCircle } from 'lucide-react'
import RiskBadge from '../components/RiskBadge'
import HealthFacilitiesMap from '../components/HealthFacilitiesMap'

export default function ResultPage() {
  const location = useLocation()
  const { prediction, probability, message } = location.state || {}

  if (prediction === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-6 text-lg font-medium">Không có dữ liệu chẩn đoán</p>
          <Link to="/diagnosis" className="inline-block px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-cyan-700 transition">
            Quay lại biểu mẫu chẩn đoán
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {prediction === 0 ? (
        // Low Risk: Centered Layout
        <div className="min-h-screen bg-slate-50 flex items-start justify-center py-8 px-4 relative overflow-hidden">
          {/* Background Orbs */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <CheckCircle className="w-16 h-16 text-teal-500" />
              </motion.div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                Kết quả Chẩn đoán
              </h1>
              <p className="text-slate-500 font-medium text-lg">Chúc mừng bạn có nguy cơ thấp</p>
            </div>

            <RiskBadge prediction={prediction} probability={probability} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-6"
            >
              {/* Summary */}
              <div className="glass-card p-8 rounded-[32px]">
                <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>📋 Tóm tắt Kết quả</h2>
                <p className="text-slate-700 leading-relaxed text-lg font-medium">{message}</p>
              </div>

              {/* Important Notice */}
              <div className="glass-card border-2 border-amber-200/50 p-6 rounded-[24px] bg-amber-50/30">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-2">⚠️ Thông báo Quan trọng</h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Dự đoán này dựa trên mô hình học máy và không nên được coi là chẩn đoán y tế. 
                      Vui lòng tư vấn với bác sĩ chuyên khoa để được đánh giá y tế chính xác.
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Advice */}
              <div className="glass-card border-2 border-teal-200/50 p-6 rounded-[24px] bg-teal-50/30">
                <div className="flex gap-4">
                  <Heart className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-teal-900 mb-3">💪 Lời Khuyên Sức Khỏe</h3>
                    <ul className="text-teal-800 space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Ăn uống lành mạnh, dinh dưỡng cân bằng</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Tập thể dục ít nhất 150 phút/tuần</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Duy trì cân nặng lành mạnh</span>
                      </li>
                      <li className="flex gap-2">
                        <span>✓</span>
                        <span>Kiểm tra sức khỏe thường xuyên</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="glass-card border-2 border-cyan-200/50 p-6 rounded-[24px] bg-cyan-50/30">
                <div className="flex gap-4">
                  <MessageCircle className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-cyan-900 mb-2">💬 Trợ Lý AI</h3>
                    <p className="text-cyan-800 text-sm">
                      Bấm nút chat để mở AI assistant và nhận lời khuyên chi tiết!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/history" 
                    className="block w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-bold text-center transition shadow-lg shadow-teal-500/20"
                  >
                    📊 Lịch sử
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/diagnosis" 
                    className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-bold text-center transition"
                  >
                    🔄 Tái chẩn đoán
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        // High Risk: Two-Column Layout
        <div className="flex gap-6 h-screen overflow-hidden bg-slate-50">
          {/* Left: Diagnosis Result (40%) */}
          <div className="w-2/5 overflow-y-auto p-8 flex flex-col relative">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/3 rounded-full blur-[120px] -z-10" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <AlertCircle className="w-16 h-16 text-red-500" />
                </motion.div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Kết quả Chẩn đoán
                </h1>
                <p className="text-slate-500 font-medium">Nguy cơ cao phát hiện</p>
              </div>

              <RiskBadge prediction={prediction} probability={probability} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 space-y-6"
              >
                {/* Summary */}
                <div className="glass-card p-6 rounded-[28px]">
                  <h2 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>📋 Tóm tắt Kết quả</h2>
                  <p className="text-slate-700 leading-relaxed font-medium text-sm">{message}</p>
                </div>

                {/* Important Notice */}
                <div className="glass-card border-2 border-amber-200/50 p-5 rounded-[24px] bg-amber-50/30">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-900 mb-1 text-sm">⚠️ Thông báo Quan trọng</h3>
                      <p className="text-amber-800 text-xs leading-relaxed">
                        Dự đoán này dựa trên mô hình học máy và không nên được coi là chẩn đoán y tế.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Recommended */}
                <div className="glass-card border-2 border-red-200/50 p-5 rounded-[24px] bg-red-50/30">
                  <div className="flex gap-3">
                    <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-2 text-sm">🏥 Hành động Khuyến nghị</h3>
                      <ul className="text-red-800 space-y-1 text-xs">
                        <li className="flex gap-2">
                          <span>→</span>
                          <span>Lên lịch khám với bác sĩ của bạn</span>
                        </li>
                        <li className="flex gap-2">
                          <span>→</span>
                          <span>Làm xét nghiệm sàng lọc tiểu đường</span>
                        </li>
                        <li className="flex gap-2">
                          <span>→</span>
                          <span>Theo dõi nồng độ đường huyết</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Health Advice */}
                <div className="glass-card border-2 border-teal-200/50 p-5 rounded-[24px] bg-teal-50/30">
                  <div className="flex gap-3">
                    <Heart className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-teal-900 mb-2 text-sm">💪 Lời Khuyên Sức Khỏe</h3>
                      <ul className="text-teal-800 space-y-1 text-xs">
                        <li>✓ Tập thể dục 150+ phút/tuần</li>
                        <li>✓ Giảm lượng đường tiêu thụ</li>
                        <li>✓ Kiểm tra sức khỏe thường xuyên</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="glass-card border-2 border-cyan-200/50 p-5 rounded-[24px] bg-cyan-50/30">
                  <div className="flex gap-3">
                    <MessageCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-cyan-900 mb-1 text-sm">💬 Trợ Lý AI</h3>
                      <p className="text-cyan-800 text-xs">
                        Bấm chat để nhận lời khuyên chi tiết!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/history" 
                      className="block w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-4 py-2.5 rounded-2xl font-bold text-center text-sm transition"
                    >
                      📊 Lịch sử
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/diagnosis" 
                      className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2.5 rounded-2xl font-bold text-center text-sm transition"
                    >
                      🔄 Tái chẩn đoán
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Healthcare Facilities Map (60%) */}
          <div className="w-3/5 flex-shrink-0">
            <HealthFacilitiesMap />
          </div>
        </div>
      )}
    </>
  )
}