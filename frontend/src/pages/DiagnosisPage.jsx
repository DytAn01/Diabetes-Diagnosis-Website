import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Stethoscope, 
  Droplets, 
  Search, 
  RotateCcw, 
  Info,
  User,
  Activity,
  ChevronRight,
  ClipboardList
} from 'lucide-react'
import axiosClient from '../api/axiosClient'
import { useChat } from '../context/ChatContext'

export default function DiagnosisPage() {
  const [formData, setFormData] = useState({
    glucose: '',
    hba1c: '',
    bmi: '',
    blood_pressure: '',
    waist: '',
    age: '',
    family_history: 0,
    insulin: '',
    skin_thickness: '',
    pregnancies: '',
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setDiagnosis } = useChat()

  const handleChange = (e) => {
    const { name, value } = e.target
    const textFields = ['note']
    const intFields = ['age', 'pregnancies', 'family_history']

    setFormData(prev => {
      if (textFields.includes(name)) {
        return { ...prev, [name]: value }
      }
      if (intFields.includes(name)) {
        return { ...prev, [name]: value === '' ? '' : parseInt(value, 10) }
      }
      return { ...prev, [name]: value === '' ? '' : parseFloat(value) }
    })
  }

  const handleReset = () => {
    setFormData({
      glucose: '',
      hba1c: '',
      bmi: '',
      blood_pressure: '',
      waist: '',
      age: '',
      family_history: 0,
      insulin: '',
      skin_thickness: '',
      pregnancies: '',
      note: ''
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submitData = {
        glucose: parseFloat(formData.glucose) || 0,
        hba1c: parseFloat(formData.hba1c) || 0,
        bmi: parseFloat(formData.bmi) || 0,
        blood_pressure: parseFloat(formData.blood_pressure) || 0,
        waist: parseFloat(formData.waist) || 0,
        age: parseInt(formData.age, 10) || 0,
        family_history: parseInt(formData.family_history, 10) || 0,
        insulin: parseFloat(formData.insulin) || 0,
        skin_thickness: parseFloat(formData.skin_thickness) || 0,
        pregnancies: parseInt(formData.pregnancies, 10) || 0,
        note: formData.note
      }
      const response = await axiosClient.post('/predict/', submitData)
      
      setDiagnosis({
        prediction: response.data.prediction,
        probability: response.data.probability,
        ...submitData
      })
      
      navigate('/result', { 
        state: { 
          prediction: response.data.prediction,
          probability: response.data.probability,
          message: response.data.message,
          ...submitData
        }
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (name, label, Icon, placeholder, min = 0, step = 0.1) => (
    <div className="space-y-2 group">
      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-teal-600 transition-colors">
        <Icon size={12} /> {label}
      </label>
      <input
        type="number"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-teal-500/30 focus:ring-8 focus:ring-teal-500/5 transition-all"
      />
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-100">
            <ClipboardList size={10} /> Đánh giá lâm sàng
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Cổng Đánh giá Nguy cơ</h1>
          <p className="text-lg text-slate-500 font-medium">Vui lòng cung cấp dữ liệu sinh trắc để mô hình ML phân tích chính xác.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors"
          >
            <RotateCcw size={14} /> Clear Form
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Blood Metrics Section */}
          <section className="glass-card p-10 rounded-[40px] border-white space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
                <Droplets size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Chỉ số huyết học</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderField('glucose', 'Glucose (mg/dL)', Activity, 'Ví dụ: 120')}
              {renderField('hba1c', 'HbA1c (%)', Activity, 'Ví dụ: 5.8')}
              {renderField('insulin', 'Insulin (mIU/L)', Droplets, 'Ví dụ: 15')}
            </div>
          </section>

          {/* Biometrics Section */}
          <section className="glass-card p-10 rounded-[40px] border-white space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                <Activity size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Chỉ số sinh lý</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderField('bmi', 'BMI (kg/m²)', User, 'Ví dụ: 24.5')}
              {renderField('blood_pressure', 'Huyết áp tâm trời (mmHg)', Activity, 'Ví dụ: 80')}
              {renderField('waist', 'Vòng eo (cm)', Activity, 'Ví dụ: 90')}
              {renderField('skin_thickness', 'Độ dày da (mm)', Activity, 'Ví dụ: 20')}
            </div>
          </section>

          {/* Demographics Section */}
          <section className="glass-card p-10 rounded-[40px] border-white space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shadow-inner">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Thông tin bệnh nhân</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderField('age', 'Tuổi (năm)', User, 'Ví dụ: 45', 0, 1)}
              {renderField('pregnancies', 'Số lần mang thai', User, 'Số lần', 0, 1)}
              
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                  <ClipboardList size={12} /> Tiền sử gia đình
                </label>
                <select
                  name="family_history"
                  value={formData.family_history}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-teal-500/30 focus:ring-8 focus:ring-teal-500/5 transition-all appearance-none cursor-pointer"
                >
                  <option value={0}>Không có tiền sử</option>
                  <option value={1}>Có tiền sử</option>
                </select>
              </div>
            </div>
          </section>

          {/* Note Section */}
          <section className="space-y-4">
             <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
               <ClipboardList size={12} /> Ghi chú lâm sàng bổ sung
             </label>
             <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Dị ứng, bệnh mạn tính hoặc triệu chứng kèm theo..."
               rows={4}
               className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-[32px] text-slate-900 font-medium focus:outline-none focus:border-teal-500/30 focus:ring-8 focus:ring-teal-500/5 transition-all"
             />
          </section>

          {/* Submit */}
          <div className="pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-slate-900 text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? (
                <>
                  <Activity className="animate-spin" size={20} />
                  <span>Đang xử lý kết quả...</span>
                </>
              ) : (
                <>
                  <Search size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span>Tạo đánh giá nguy cơ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Information */}
        <aside className="space-y-8">
          <div className="glass-card p-10 rounded-[40px] bg-teal-50/50 border-teal-100/50 space-y-6">
            <div className="w-12 h-12 bg-white text-teal-500 rounded-2xl flex items-center justify-center shadow-sm">
              <Info size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Hướng dẫn bác sĩ</h3>
            <ul className="space-y-4">
              {[
                "Sử dụng báo cáo xét nghiệm gần nhất (3-6 tháng).",
                "Glucose lúc đói cung cấp giá trị dự đoán tốt nhất.",
                "Để trống nếu không biết; mô hình sẽ tự điều chỉnh.",
                "Tất cả tham số được mã hóa an toàn và xử lý cục bộ."
              ].map((text, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-10 rounded-[40px] bg-slate-900 text-white space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Stethoscope size={80} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Ghi chú bảo mật</p>
             <p className="text-sm font-medium leading-relaxed opacity-70">
               Phân tích này sử dụng kiến trúc xử lý phân tán. Dữ liệu sinh trắc của bạn không được lưu trữ lâu dài trên máy chủ công cộng và chỉ dùng để tính điểm nguy cơ ngay lập tức.
             </p>
          </div>
        </aside>
      </form>
    </motion.div>
  )
}
