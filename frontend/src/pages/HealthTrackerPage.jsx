import HealthTracker from '../components/HealthTracker'
import { Activity, Sparkles, TrendingUp } from 'lucide-react'

function HealthTrackerPage() {
  return (
    <div className="space-y-10 pb-12">
      <section className="relative overflow-hidden rounded-[36px] bg-slate-900 p-10 md:p-12 shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.45),transparent_55%)]" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-300">
            <Activity size={12} /> Theo dõi sức khỏe
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Bảng điều khiển Chỉ số Sức khỏe
            </h1>
            <p className="text-base md:text-lg text-slate-300 font-medium leading-relaxed">
              Theo dõi biến động đường huyết, BMI, huyết áp, insulin và điểm rủi ro theo thời gian để ra quyết định sớm hơn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-slate-100">
              <Sparkles size={14} className="text-teal-300" /> Đồng bộ với dữ liệu chẩn đoán
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-slate-100">
              <TrendingUp size={14} className="text-cyan-300" /> Phân tích xu hướng theo thời gian
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card rounded-[26px] p-5 border-white/60">
          <h3 className="font-black text-slate-900 mb-2 text-sm uppercase tracking-wide">Theo dõi định kỳ</h3>
          <p className="text-sm text-slate-600 font-medium">Ghi nhận chỉ số mỗi tuần hoặc mỗi tháng để thấy xu hướng rõ ràng.</p>
        </div>
        <div className="glass-card rounded-[26px] p-5 border-white/60">
          <h3 className="font-black text-slate-900 mb-2 text-sm uppercase tracking-wide">Phân tích xu hướng</h3>
          <p className="text-sm text-slate-600 font-medium">Biểu đồ cho thấy bạn đang cải thiện, ổn định hay có dấu hiệu xấu đi.</p>
        </div>
        <div className="glass-card rounded-[26px] p-5 border-white/60">
          <h3 className="font-black text-slate-900 mb-2 text-sm uppercase tracking-wide">Mục tiêu thực tế</h3>
          <p className="text-sm text-slate-600 font-medium">Dùng dữ liệu lịch sử để đặt mục tiêu sức khỏe phù hợp và bền vững.</p>
        </div>
      </div>

      <HealthTracker />
    </div>
  )
}

export default HealthTrackerPage
