import { useLocation, Link } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'

export default function ResultPage() {
  const location = useLocation()
  const { prediction, probability, message } = location.state || {}

  if (prediction === undefined) {
    return (
      <div className="text-center">
        <p className="text-gray-600 mb-4">Không có dữ liệu chẩn đoán</p>
        <Link to="/diagnosis" className="text-blue-600 hover:underline">
          Quay lại biểu mẫu chẩn đoán
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Kết quả Chẩn đoán</h1>

      <RiskBadge prediction={prediction} probability={probability} />

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Tóm tắt Kết quả</h2>
        <p className="text-lg text-gray-700 mb-4">{message}</p>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">⚠️ Thông báo Quan trọng</h3>
          <p className="text-gray-700">
            Dự đoán này dựa trên mô hình học máy và không nên được coi là chẩn đoán y tế. 
            Vui lòng tư vấn với bác sĩ chuyên khoa để được đánh giá y tế chính xác và điều trị.
          </p>
        </div>

        {prediction === 1 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-red-700 mb-2">🏥 Các Hành động Được Khuyến nghị</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Lên lịch khám với bác sĩ của bạn</li>
              <li>• Làm xét nghiệm sàng lọc tiểu đường đầy đủ</li>
              <li>• Tìm hiểu về phòng ngừa và quản lý tiểu đường</li>
              <li>• Theo dõi nồng độ đường huyết thường xuyên</li>
            </ul>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-green-700 mb-2">💪 Lời Khuyên Sức khỏe</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Duy trì chế độ ăn uống lành mạnh với dinh dưỡng cân bằng</li>
            <li>• Tập thể dục thường xuyên ít nhất 150 phút mỗi tuần</li>
            <li>• Duy trì cân nặng lành mạnh</li>
            <li>• Kiểm tra sức khỏe thường xuyên</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-blue-700 mb-2">💬 Nhận Lời Khuyên Từ AI</h3>
          <p className="text-gray-700 mb-3">
            Bấm nút chat bên phải dưới để mở trợ lý sức khỏe AI. Nó sẽ tự động phân tích kết quả chẩn đoán 
            của bạn và đưa ra lời khuyên cụ thể!
          </p>
          <p className="text-sm text-blue-600 font-semibold">💡 Mẹo: Bạn có thể hỏi thêm các câu hỏi về sức khỏe, độc lập với chẩn đoán này.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-4 justify-center mb-8">
        <Link 
          to="/history" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Xem Lịch sử
        </Link>
        <Link 
          to="/diagnosis" 
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Chẩn đoán Mới
        </Link>
      </div>
    </div>
  )
}
