import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      
      // Set diagnosis data in context for floating chat
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

  const renderField = (name, label, placeholder, description, min = 0, step = 0.1) => (
    <div className="mb-4">
      <label className="block text-gray-700 font-bold mb-1">{label}</label>
      <input
        type="number"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-2">📋 Chẩn đoán Tiểu đường</h1>
      <p className="text-gray-600 mb-6">Nhập các chỉ số y tế của bạn để đánh giá nguy cơ</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Glucose Levels Section */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">🩸 Chỉ số Glucose</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(
              'glucose',
              'Mức Glucose (mg/dL)',
              'VD: 120',
              'Mức đường huyết khi nhịn ăn. Bình thường: 70-100'
            )}
            {renderField(
              'hba1c',
              'HbA1c (%)',
              'VD: 5.8',
              'Mức đường huyết trung bình 3 tháng. Bình thường: < 5.7'
            )}
            {renderField(
              'insulin',
              'Mức Insulin (mIU/L)',
              'VD: 10',
              'Bình thường: 12-58'
            )}
          </div>
        </div>

        {/* Body Measurements Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">⚖️ Chỉ số Cơ thể</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(
              'bmi',
              'BMI (kg/m²)',
              'VD: 25',
              'Cân nặng (kg) ÷ chiều cao (m)². Bình thường: 18.5-24.9'
            )}
            {renderField(
              'blood_pressure',
              'Huyết áp (mmHg)',
              'VD: 80',
              'Huyết áp tối thiểu. Bình thường: < 80'
            )}
            {renderField(
              'waist',
              'Vòng eo (cm)',
              'VD: 90',
              'Vòng eo. Cảnh báo: > 94 cm (nam), > 80 cm (nữ)'
            )}
            {renderField(
              'skin_thickness',
              'Độ dày da (mm)',
              'VD: 20',
              'Dày của da lưng tay'
            )}
          </div>
        </div>

        {/* Demographics Section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">👤 Thông tin Cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField(
              'age',
              'Tuổi (năm)',
              'VD: 35',
              'Tuổi hiện tại. Nguy cơ tăng từ 45 tuổi'
            )}
            {renderField(
              'pregnancies',
              'Số lần sinh',
              'VD: 2',
              'Số lần mang thai (chỉ nữ)'
            )}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Tiền sử Gia đình</label>
              <select
                name="family_history"
                value={formData.family_history}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value={0}>0 - Không có tiền sử tiểu đường</option>
                <option value={1}>1 - Có tiền sử tiểu đường trong gia đình</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Có người trong gia đình mắc bệnh tiểu đường</p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Ghi chú Thêm</h2>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Ghi chú thêm về tình trạng sức khỏe, dị ứng, bệnh kèm theo... (tùy chọn)"
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {loading ? '⏳ Đang phân tích...' : '🔍 Nhận Chẩn đoán'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-bold hover:bg-gray-500 transition-all"
          >
            🔄 Xóa
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
        <h3 className="font-bold text-yellow-900 mb-3">💡 Hướng dẫn nhập dữ liệu</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>✓ Lấy dữ liệu từ kết quả xét nghiệm y tế gần nhất</li>
          <li>✓ Tất cả các chỉ số đều được khuyến nghị, nhưng có thể bỏ trống nếu chưa biết</li>
          <li>✓ Kết quả chẩn đoán chỉ mang tính tham khảo, không thay thế tư vấn bác sĩ</li>
          <li>✓ Nếu nghi ngờ mắc tiểu đường, vui lòng gặp bác sĩ để kiểm tra thực tế</li>
        </ul>
      </div>
    </div>
  )
}
