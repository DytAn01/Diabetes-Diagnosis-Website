import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  History, 
  ClipboardCheck,
  Heart,
  Activity,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import RiskBadge from '../components/RiskBadge'

export default function ResultPage() {
  const location = useLocation()
  const { prediction, probability, message } = location.state || {}

  if (prediction === undefined) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Không tìm thấy dữ liệu</h2>
        <p className="text-slate-500 font-medium italic">Không thể lấy kết quả chẩn đoán từ phiên làm việc hiện tại.</p>
        <Link 
          to="/diagnosis" 
          className="inline-flex items-center gap-2 text-teal-600 font-bold hover:underline"
        >
          <ArrowLeft size={16} /> Quay lại trang đánh giá
        </Link>
      </div>
    )
  }

  const isHighRisk = prediction === 1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      {/* Header */}
      <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
            <ClipboardCheck size={12} /> Báo cáo chẩn đoán đã tạo
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Kết quả phân tích lâm sàng</h1>
      </header>

      {/* Probability Gauge Section */}
      <section className="relative glass-card p-12 rounded-[48px] border-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           {isHighRisk ? <ShieldAlert size={200} /> : <ShieldCheck size={200} />}
        </div>
        
        <div className="flex flex-col items-center space-y-8 relative z-10">
           <RiskBadge prediction={prediction} probability={probability} />
           
           <div className="max-w-2xl text-center">
               <p className="text-2xl font-bold text-slate-800 leading-snug">
               {message}
             </p>
           </div>
        </div>
      </section>

      {/* Actionable Insights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recommendation Cards */}
        {isHighRisk && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 rounded-[40px] border-red-100 bg-red-50/30 space-y-6"
          >
            <div className="flex items-center gap-4 text-red-600">
              <Activity size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">Quy trình lâm sàng</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Lên lịch khám ưu tiên với bác sĩ Nội tiết.",
                "Thực hiện xét nghiệm HbA1c và Glucose lúc đói đầy đủ.",
                "Bắt đầu theo dõi đường huyết hàng ngày.",
                "Xem xét can thiệp lối sống ngay lập tức cho nhóm nguy cơ cao."
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-red-900/70 font-medium leading-relaxed">
                  <ChevronRight size={14} className="mt-1 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-10 rounded-[40px] border-teal-100 bg-teal-50/30 space-y-6"
        >
          <div className="flex items-center gap-4 text-teal-600">
            <Heart size={24} />
            <h3 className="text-xl font-black uppercase tracking-tight">Hướng dẫn sức khỏe</h3>
          </div>
          <ul className="space-y-4">
            {[
              "Duy trì chế độ ăn ít đường, nhiều chất xơ.",
              "Tập aerobic vừa phải ít nhất 150 phút mỗi tuần.",
              "Ưu tiên ngủ 7-9 tiếng để cân bằng nội tiết.",
              "Khám theo dõi chuyển hóa hai lần một năm."
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-teal-900/70 font-medium leading-relaxed">
                <ChevronRight size={14} className="mt-1 shrink-0 text-teal-400" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* AI Assistant Callout */}
      {/* <section className="relative group p-10 rounded-[40px] bg-slate-900 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
           <div className="space-y-4 max-w-xl">
             <div className="inline-flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase tracking-widest">
               <Sparkles size={12} /> Tư vấn AI tự động
             </div>
             <h3 className="text-3xl font-black tracking-tight">Phân tích chi tiết kết quả</h3>
             <p className="text-slate-400 font-medium leading-relaxed">
               Trợ lý AI lâm sàng đang phân tích các chỉ số của bạn. Mở cửa sổ chat bảo mật để thảo luận các điều chỉnh lối sống và chế độ ăn cá nhân hóa.
             </p>
           </div>
           
           <div className="flex items-center py-4">
              <div className="p-4 bg-teal-500 text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center gap-2 group-hover:scale-105 transition-transform duration-500">
                <MessageSquare size={18} /> Chat with AI
              </div>
           </div>
        </div>
      </section> */}

      {/* Warnings & Disclaimer */}
      <section className="bg-amber-50/50 border border-amber-100 p-8 rounded-[32px] flex gap-6 text-amber-900">
         <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
            <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest">Lưu ý y tế</h4>
            <p className="text-xs font-medium leading-relaxed opacity-80 italic">
              Các tỉ lệ và dự đoán ở đây được tính bằng mô hình học máy xác suất. Chỉ dùng để sàng lọc và không thay thế chẩn đoán chính thức. Mọi kết luận lâm sàng cần được bác sĩ có giấy phép xác minh.
            </p>
         </div>
      </section>

      {/* Navigation Footer */}
      <footer className="flex items-center justify-center gap-8">
        <Link 
          to="/history" 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors"
        >
          <History size={16} /> Lưu trữ phân tích
        </Link>
        <Link 
          to="/diagnosis" 
          className="flex items-center gap-3 bg-white border-2 border-slate-100 hover:border-teal-500/20 px-8 py-4 rounded-2xl text-slate-900 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95"
        >
          Đánh giá mới <ChevronRight size={14} />
        </Link>
      </footer>
    </motion.div>
  )
}
