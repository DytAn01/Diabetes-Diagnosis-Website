import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Đánh giá Nguy cơ Tiểu đường</h1>
        <p className="text-xl mb-8">
          Phát hiện sớm có thể cứu sống. Nhận đánh giá nguy cơ của bạn hôm nay.
        </p>
        {isAuthenticated ? (
          <Link 
            to="/diagnosis" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Bắt đầu Chẩn đoán
          </Link>
        ) : (
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Bắt đầu
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">🔬 Mô hình ML Nâng cao</h3>
          <p>Sử dụng học máy để dự đoán nguy cơ tiểu đường với độ chính xác cao.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">📊 Lịch sử Sức khỏe</h3>
          <p>Theo dõi các chẩn đoán của bạn theo thời gian và giám sát tiến triển sức khỏe.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">📚 Bài viết Sức khỏe</h3>
          <p>Truy cập các bài viết sức khỏe được tuyển chọn và tài nguyên giáo dục.</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Về Ứng dụng này</h2>
        <p className="text-gray-700 mb-4">
          Ứng dụng chẩn đoán tiểu đường này sử dụng một mô hình học máy được đào tạo
          dựa trên Tập dữ liệu Tiểu đường của Người Ấn độ PIMA để đánh giá nguy cơ tiểu đường của bạn.
        </p>
        <p className="text-gray-700">
          Ứng dụng phân tích các chỉ số y tế bao gồm nồng độ glucose, huyết áp, BMI,
          và các số liệu sức khỏe khác để cung cấp đánh giá nguy cơ. Luôn tư vấn với bác sĩ chuyên khoa
          để được tư vấn y tế.
        </p>
      </div>
    </div>
  )
}
