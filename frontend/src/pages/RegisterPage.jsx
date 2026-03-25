import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Calendar, 
  Phone, 
  ChevronLeft, 
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import axiosClient from '../api/axiosClient'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    dob: '',
    gender: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axiosClient.post('/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Account establishment failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-teal-500/30 focus:ring-8 focus:ring-teal-500/5 transition-all outline-none"
  const labelClasses = "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-teal-600 transition-colors mb-2"

  return (
    <div className="min-h-screen py-20 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] -z-10" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Back Link */}
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 transition-colors group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Quay lại cổng</span>
          </Link>

        {/* Register Card */}
        <div className="glass-card p-10 md:p-16 rounded-[60px] border-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            
            {/* Left Column: Visual & Info */}
            <div className="lg:col-span-2 space-y-12">
               <div className="space-y-6">
                 <div className="w-16 h-16 bg-teal-500 text-slate-900 rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/20">
                    <UserPlus size={32} />
                 </div>
                 <div className="space-y-3">
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Cổng đăng ký</h1>
                   <p className="text-slate-500 font-medium leading-relaxed">Tham gia thế hệ giám sát sức khỏe chuyển hóa tiếp theo.</p>
                 </div>
               </div>

               <div className="space-y-6">
                  {[
                    "Truy cập bảng điều khiển lâm sàng thống nhất",
                    "Lưu trữ dữ liệu sức khỏe theo thời gian",
                    "Ưu tiên tư vấn y tế bằng AI",
                    "Mã hóa đầu-cuối cho dữ liệu lâm sàng"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                          <CheckCircle2 size={16} />
                       </div>
                       <span className="text-sm font-bold text-slate-600 tracking-tight">{benefit}</span>
                    </div>
                  ))}
               </div>

               <div className="p-8 bg-slate-900 rounded-[40px] text-white space-y-4">
                  <div className="inline-flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                     <ShieldCheck size={12} /> Privacy First
                   </div>
                   <p className="text-xs font-medium text-slate-400 leading-relaxed">
                     Your clinical data is processed on high-security nodes and never shared without explicit authorization.
                   </p>
               </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                  >
                    <AlertCircle size={18} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Basics */}
                  <div className="space-y-6 md:col-span-2">
                    <div className="space-y-2 group">
                      <label className={labelClasses}><Mail size={12} /> Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="bacsi@benhvien.com" className={inputClasses} />
                    </div>
                    <div className="space-y-2 group">
                      <label className={labelClasses}><Lock size={12} /> Mật khẩu</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className={inputClasses} />
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-2 group">
                    <label className={labelClasses}><User size={12} /> Họ và tên</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" className={inputClasses} />
                  </div>
                  <div className="space-y-2 group">
                    <label className={labelClasses}><Calendar size={12} /> Ngày sinh</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClasses} />
                  </div>
                  <div className="space-y-2 group">
                    <label className={labelClasses}><Activity size={12} /> Giới tính</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                      <option value="">Chọn</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="space-y-2 group">
                    <label className={labelClasses}><Phone size={12} /> Số điện thoại</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+84 912 345 678" className={inputClasses} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative overflow-hidden bg-slate-900 text-white py-6 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
                >
                   {loading ? (
                      <Activity className="animate-spin" size={18} />
                   ) : (
                      <>
                        <span>Đăng ký tài khoản</span>
                        <ArrowRight size={18} className="text-teal-400 group-hover:translate-x-1 transition-transform" />
                      </>
                   )}
                </button>
              </form>

              <footer className="mt-12 text-center md:text-left">
                <p className="text-sm font-medium text-slate-500">
                  Already established an identity? 
                  <Link to="/login" className="text-teal-600 font-black tracking-tight hover:underline ml-2">
                    Đăng nhập <ArrowRight size={14} className="inline ml-1" />
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
