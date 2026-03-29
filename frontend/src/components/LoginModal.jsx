import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, ShieldCheck } from 'lucide-react'

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    // Close modal on Escape key
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLoginClick = () => {
    onClose()
    navigate('/login')
  }

  const handleRegisterClick = () => {
    onClose()
    navigate('/register')
  }

  return (
    <>
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-40">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="pointer-events-auto w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="glass-card rounded-[32px] overflow-hidden shadow-2xl border-white/50">
          {/* Top Visual Icon */}
          <div className="flex justify-center pt-8 pb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition"
              aria-label="Đóng"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Header */}
          <div className="relative px-8 py-6 text-center space-y-1">
            
            <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Bắt buộc đăng nhập
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Vui lòng đăng nhập để sử dụng tính năng này
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 space-y-4">
            {/* Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoginClick}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition shadow-md"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              Đăng nhập
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegisterClick}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
            >
              Tạo tài khoản
            </motion.button>

            <p className="text-xs text-slate-500 text-center pt-2">
              Nhấn <kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">ESC</kbd> để đóng
            </p>
          </div>
        </div>
      </motion.div>
      </div>
    </>
  )
}
