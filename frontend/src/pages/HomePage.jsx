import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Activity, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  Heart,
  Microscope,
  Database
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 100
      }
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-24 pb-20"
    >
      {/* Hero Section */}
      <section className="relative group">
        {/* Abstract Background Blur */}
        <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
        
        <div className="relative bg-slate-900 rounded-[40px] p-12 md:p-20 overflow-hidden shadow-2xl">
          {/* Animated Mesh Overlay */}
          <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.3),transparent_70%)]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-[0.2em]">
              <Activity size={14} /> Chẩn đoán bằng AI
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
              Tiên phong trong <span className="text-teal-400">Đánh giá</span> <br />Nguy cơ Tiểu đường
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Ứng dụng học máy tiên tiến để cung cấp những phân tích y khoa về sức khỏe chuyển hóa của bạn. Phát hiện sớm là bước đầu tiên hướng tới tương lai khỏe mạnh hơn.
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-4">
              {isAuthenticated ? (
                <Link 
                  to="/diagnosis" 
                  className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-slate-900 px-10 py-5 rounded-2xl font-black transition-all shadow-lg shadow-teal-500/20 transform hover:-translate-y-1 active:scale-95 group/btn"
                >
                  Bắt đầu chẩn đoán <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-slate-900 px-10 py-5 rounded-2xl font-black transition-all shadow-lg shadow-teal-500/20 transform hover:-translate-y-1 active:scale-95 group/btn"
                >
                  Tham gia mạng lưới <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
            {
            icon: Microscope,
            title: "Phân tích ML",
            desc: "Mô hình dự đoán được huấn luyện trên bộ dữ liệu sức khỏe dài hạn để đạt độ chính xác cao.",
            color: "text-blue-500"
          },
          {
            icon: ShieldCheck,
            title: "Lịch sử sức khỏe",
            desc: "Lưu trữ mã hóa an toàn các chỉ số và tiến triển chuyển hóa theo thời gian.",
            color: "text-teal-500"
          },
          {
            icon: BookOpen,
            title: "Thư viện lâm sàng",
            desc: "Tài nguyên và bài viết được chuyên gia kiểm duyệt về quản lý tiểu đường và phòng ngừa.",
            color: "text-purple-500"
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="glass-card p-10 rounded-[32px] hover:shadow-xl transition-all duration-500 group border-white/50"
          >
            <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform ${feature.color}`}>
              <feature.icon size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Scientific Foundation Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-slate-200/50 rounded-[48px] -skew-y-1 -z-10" />
        <div className="p-12 md:p-20 flex flex-col md:flex-row items-center gap-16">
          <motion.div variants={itemVariants} className="md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
              <Database size={10} /> Nguồn dữ liệu: PIMA Indian Diabetes Dataset
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              Dựa trên <span className="text-teal-600 underline decoration-teal-500/20 underline-offset-8">Tính toàn vẹn khoa học</span>
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Nền tảng đánh giá của chúng tôi sử dụng các mô hình học máy mạnh mẽ được đào tạo trên Cơ sở dữ liệu Tiểu đường PIMA Indian được công nhận trên toàn cầu. Bằng cách phân tích các dấu ấn sinh học quan trọng—bao gồm nồng độ glucose, huyết áp và BMI—chúng tôi cung cấp đánh giá rủi ro sơ bộ giúp người dùng chủ động thực hiện các bước.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(n => (
                  <div key={n} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                    {n}
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-900 tracking-tight">Đã được xác minh bởi hơn 4.000 mô phỏng dữ liệu</p>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="md:w-1/2 w-full glass-card p-8 rounded-[40px] shadow-2xl border-white/80"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Độ chính xác chẩn đoán</span>
                <span className="text-xs font-black text-teal-500">92.4%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92.4%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Xử lý</p>
                  <p className="text-xl font-black text-slate-900">Thời gian thực</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bảo mật</p>
                  <p className="text-xl font-black text-slate-900">Mã hóa</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advisory Footer */}
      <section className="text-center max-w-2xl mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <Heart size={24} />
          </div>
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tuyên bố miễn trừ trách nhiệm lâm sàng</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
          Công cụ chẩn đoán kỹ thuật số này chỉ nhằm mục đích cung cấp thông tin và giáo dục. Nó không thay thế cho lời khuyên, chẩn đoán hoặc điều trị y tế chuyên nghiệp. Luôn tham khảo ý kiến của nhà cung cấp dịch vụ chăm sóc sức khỏe đủ tiêu chuẩn để được đánh giá lâm sàng.
        </p>
      </section>
    </motion.div>
  )
}
