import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  Activity,
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Fingerprint
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import axiosClient from '../api/axiosClient'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email || !formData.password) {
      setError('Vui lòng cung cấp email và mật khẩu.')
      return
    }
    
    setLoading(true)

    try {
      const response = await axiosClient.post('/auth/login', formData)
      login(response.data.user, response.data.access_token)
      
      if (rememberMe) {
        localStorage.setItem('remember_email', formData.email)
      } else {
        localStorage.removeItem('remember_email')
      }
      
      navigate('/diagnosis')
    } catch (err) {
      setError(err.response?.data?.error || 'Xác thực thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Login Card */}
        <div className="glass-card p-10 md:p-14 rounded-[48px] border-white shadow-2xl relative overflow-hidden">
          {/* Top Visual */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl relative transform -rotate-6">
               <Fingerprint size={28} className="text-teal-400" />
            </div>
          </div>

          <header className="text-center space-y-3 mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cổng Chẩn đoán</h1>
            <p className="text-slate-500 font-medium">Truy cập an toàn vào hệ thống chẩn đoán.</p>
          </header>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-teal-600 transition-colors">
                <Mail size={12} /> Email cơ quan
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="bacsi@benhvien.com"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-teal-500/30 focus:ring-8 focus:ring-teal-500/5 transition-all outline-none"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-teal-600 transition-colors">
                  <Lock size={12} /> Mật khẩu
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-teal-500/30 focus:ring-8 focus:ring-teal-500/5 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-teal-600 bg-slate-100 border-slate-200 rounded focus:ring-teal-500 focus:ring-offset-0 transition-all cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
            >
               {loading ? (
                  <Activity className="animate-spin" size={18} />
               ) : (
                  <>
                    <span>Đăng nhập</span>
                    <LogIn size={18} className="text-teal-400 group-hover:translate-x-1 transition-transform" />
                  </>
               )}
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-50">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-400">
                  Người dùng mới?
                  <Link to="/register" className="text-teal-600 font-black tracking-tight hover:underline ml-2">
                    Đăng ký
                  </Link>
                </p>
                 <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                   <Sparkles size={10} /> Yêu cầu ID lâm sàng
                 </div>
             </div>
          </footer>
        </div>

        {/* Demo Info - Enhanced Style */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 glass-card rounded-3xl border-teal-100/30 bg-teal-50/20 text-center space-y-3"
        >
           <div className="flex items-center justify-center gap-2 text-[10px] font-black text-teal-600 uppercase tracking-widest">
             <AlertCircle size={14} /> Thông tin dùng thử
           </div>
           <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
             <code className="bg-white/80 px-3 py-1 rounded-xl border border-teal-100 text-slate-600">test@example.com</code>
             <code className="bg-white/80 px-3 py-1 rounded-xl border border-teal-100 text-slate-600">password123</code>
           </div>
        </motion.div>

        {/* Security Footnote */}
        <div className="mt-10 flex items-center justify-center gap-4 text-slate-400">
           <ShieldCheck size={20} />
           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Mã hóa đầu-cuối đang kích hoạt</p>
        </div>
      </motion.div>
    </div>
  )
}
