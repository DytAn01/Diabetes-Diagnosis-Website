import { motion } from 'framer-motion'

export default function RiskBadge({ prediction, probability }) {
  const isDiabetes = prediction === 1
  const riskPercentage = (probability * 100).toFixed(1)

  return (
    <div className={`glass-card p-8 rounded-[32px] overflow-hidden border-white/50`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className={`text-3xl font-black tracking-tight mb-2 ${
          isDiabetes ? 'text-red-600' : 'text-teal-600'
        }`} style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          {isDiabetes ? '⚠️ Phát hiện Nguy cơ Cao' : '✅ Nguy cơ Thấp'}
        </h2>
        <p className="text-slate-500 font-medium">Kết quả phân tích của bạn</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Xác suất nguy cơ</span>
          <span className={`text-lg font-black ${
            isDiabetes ? 'text-red-600' : 'text-teal-600'
          }`}>
            {riskPercentage}%
          </span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${riskPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isDiabetes
                ? 'bg-gradient-to-r from-red-500 to-red-400'
                : 'bg-gradient-to-r from-teal-500 to-cyan-400'
            }`}
          />
        </div>

        {/* Risk Status */}
        <div className={`mt-4 p-3 rounded-2xl text-center font-bold text-sm ${
          isDiabetes
            ? 'bg-red-50 text-red-700'
            : 'bg-teal-50 text-teal-700'
        }`}>
          {isDiabetes
            ? '⚠️ Nguy cơ cao - Cần tư vấn y tế'
            : '✓ Nguy cơ thấp - Duy trì lối sống lành mạnh'
          }
        </div>
      </div>
    </div>
  )
}
