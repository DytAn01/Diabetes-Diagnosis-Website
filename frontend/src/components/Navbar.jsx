import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path)
  }

  const linkClass = (path) => {
    return `px-3 py-2 rounded transition ${isActive(path) ? 'bg-white text-teal-700 font-semibold shadow-sm' : 'hover:bg-white/10'}`
  }

  return (
    <nav className="backdrop-blur-sm bg-gradient-to-r from-teal-600/85 to-cyan-600/85 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg font-extrabold text-white drop-shadow">
            <span className="sr-only">Logo</span>
            AI
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>Chẩn đoán AI</span>
            <small className="text-slate-200 text-xs -mt-0.5">Hỗ trợ quyết định y tế</small>
          </div>
        </Link>

        <button
          onClick={() => setOpen(!open)}
          aria-label="Mở menu"
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>Trang chủ</Link>
          <Link to="/articles" className={linkClass('/articles')}>Bài viết</Link>
          <Link to="/diagnosis" className={linkClass('/diagnosis')}>Chẩn đoán</Link>
          <Link to="/history" className={linkClass('/history')}>Lịch sử</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button onClick={logout} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition">Đăng nhập</Link>
              <Link to="/register" className="px-4 py-2 bg-white text-teal-700 font-semibold rounded-md shadow-sm hover:scale-[1.02] transition">Đăng ký</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${open ? 'block' : 'hidden'} px-4 pb-4`}>
        <div className="flex flex-col gap-2">
          <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded hover:bg-white/5 transition">Trang chủ</Link>
          <Link to="/articles" onClick={() => setOpen(false)} className="px-3 py-2 rounded hover:bg-white/5 transition">Bài viết</Link>
          <Link to="/diagnosis" onClick={() => setOpen(false)} className="px-3 py-2 rounded hover:bg-white/5 transition">Chẩn đoán</Link>
          <Link to="/history" onClick={() => setOpen(false)} className="px-3 py-2 rounded hover:bg-white/5 transition">Lịch sử</Link>
          <div className="pt-2 border-t border-white/5 flex gap-2">
            {isAuthenticated ? (
              <button onClick={() => { logout(); setOpen(false); }} className="flex-1 px-3 py-2 bg-white/10 rounded">Đăng xuất</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className={`flex-1 px-3 py-2 rounded ${isActive('/login') ? 'bg-white text-teal-700 font-semibold' : 'bg-white/10'}`}>Đăng nhập</Link>
                <Link to="/register" onClick={() => setOpen(false)} className={`flex-1 px-3 py-2 rounded ${isActive('/register') ? 'bg-white text-teal-700 font-semibold' : 'bg-white text-teal-700 font-semibold'}`}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
