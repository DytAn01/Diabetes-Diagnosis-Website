import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Calendar, Shield, Activity } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import axiosClient from '../api/axiosClient'

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth()
  const [profile, setProfile] = useState(user)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    avatar_url: '',
    role: 'user',
    is_active: true
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get('/auth/profile')
        setProfile(response.data)
        setForm({
          full_name: response.data?.full_name || '',
          email: response.data?.email || '',
          phone: response.data?.phone || '',
          dob: response.data?.dob || '',
          gender: response.data?.gender || '',
          avatar_url: response.data?.avatar_url || '',
          role: response.data?.role || 'user',
          is_active: Boolean(response.data?.is_active)
        })
      } catch {
        setProfile(user)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const currentProfile = profile || user
  const isAdmin = currentProfile?.role === 'admin'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone
      }

      if (isAdmin) {
        payload.dob = form.dob || null
        payload.gender = form.gender || null
        payload.avatar_url = form.avatar_url || null
        payload.role = form.role
        payload.is_active = form.is_active
      }

      const response = await axiosClient.put('/auth/profile', payload)
      const nextUser = response.data?.user
      setProfile(nextUser)
      updateUser(nextUser)
      setMessage('Cập nhật thông tin tài khoản thành công.')
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể cập nhật thông tin tài khoản')
    } finally {
      setSaving(false)
    }
  }

  const getAvatarLabel = () => {
    if (currentProfile?.full_name) {
      const parts = currentProfile.full_name.trim().split(' ').filter(Boolean)
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      return parts[0].slice(0, 2).toUpperCase()
    }
    if (currentProfile?.email) return currentProfile.email.slice(0, 2).toUpperCase()
    return 'U'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="glass-card rounded-[36px] p-8 md:p-10 border-white/60">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-lg overflow-hidden">
            {currentProfile?.avatar_url ? (
              <img src={currentProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{getAvatarLabel()}</span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900">Quản lý tài khoản</h1>
            <p className="text-slate-500 font-medium mt-1">Xem thông tin hồ sơ và quản lý phiên đăng nhập của bạn.</p>
          </div>

          <button
            onClick={logout}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[32px] p-7 border-white/60">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500">
            <Activity className="animate-spin" size={18} /> Đang tải thông tin tài khoản...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">{message}</div>}
            {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2"><User size={12} /> Họ và tên</p>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                />
              </label>

              <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2"><Mail size={12} /> Email</p>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                />
              </label>

              <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Số điện thoại</p>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                />
              </label>

              <div className="bg-white/70 rounded-2xl p-5 border border-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2"><Shield size={12} /> Vai trò</p>
                <p className="mt-3 text-lg font-bold text-slate-900">{currentProfile?.role || 'user'}</p>
              </div>

              {isAdmin && (
                <>
                  <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Ngày sinh</p>
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      onChange={handleChange}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    />
                  </label>

                  <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Giới tính</p>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    >
                      <option value="">Chưa cập nhật</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </label>

                  <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block md:col-span-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Avatar URL</p>
                    <input
                      name="avatar_url"
                      value={form.avatar_url}
                      onChange={handleChange}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    />
                  </label>

                  <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 block">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Role tài khoản</p>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </label>

                  <label className="bg-white/70 rounded-2xl p-5 border border-slate-100 flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-slate-700">Tài khoản hoạt động</span>
                  </label>
                </>
              )}

              <div className="bg-white/70 rounded-2xl p-5 border border-slate-100 md:col-span-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2"><Calendar size={12} /> Ngày tạo tài khoản</p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {currentProfile?.created_at ? new Date(currentProfile.created_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl font-bold hover:from-teal-700 hover:to-cyan-700 transition disabled:opacity-70"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          to="/diagnosis"
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-2xl font-bold hover:from-teal-700 hover:to-cyan-700 transition"
        >
          Quay lại chẩn đoán
        </Link>
      </div>
    </div>
  )
}
