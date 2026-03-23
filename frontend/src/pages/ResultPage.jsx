import { useLocation, Link } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'
import HealthFacilitiesMap from '../components/HealthFacilitiesMap'

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
    <>
      {prediction === 0 ? (
        // Low Risk: Centered Layout
        <div className="h-screen overflow-y-auto bg-gray-50 flex items-start justify-center pt-8">
          <div className="w-full max-w-2xl px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Kết quả Chẩn đoán</h1>

            <RiskBadge prediction={prediction} probability={probability} />

            <div className="mt-6 bg-white p-6 rounded-lg shadow-md space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Tóm tắt Kết quả</h2>
                <p className="text-gray-700">{message}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-sm">⚠️ Thông báo Quan trọng</h3>
                <p className="text-gray-700 text-sm">
                  Dự đoán này dựa trên mô hình học máy và không nên được coi là chẩn đoán y tế. 
                  Vui lòng tư vấn với bác sĩ chuyên khoa để được đánh giá y tế chính xác.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-bold text-green-700 mb-2 text-sm">💪 Lời Khuyên Sức Khỏe</h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Ăn uống lành mạnh, dinh dưỡng cân bằng</li>
                  <li>• Tập thể dục ít nhất 150 phút/tuần</li>
                  <li>• Duy trì cân nặng lành mạnh</li>
                  <li>• Kiểm tra sức khỏe thường xuyên</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-bold text-blue-700 mb-2 text-sm">💬 Trợ Lý AI</h3>
                <p className="text-gray-700 text-sm">
                  Bấm nút chat để mở AI assistant và nhận lời khuyên chi tiết!
                </p>
              </div>

              <div className="flex gap-3">
                <Link 
                  to="/history" 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm text-center"
                >
                  Lịch sử
                </Link>
                <Link 
                  to="/diagnosis" 
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm text-center"
                >
                  Tái chẩn đoán
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // High Risk: Two-Column Layout
        <div className="flex gap-6 h-screen overflow-hidden">
          {/* Left: Diagnosis Result (40%) */}
          <div className="w-2/5 overflow-y-auto bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Kết quả Chẩn đoán</h1>

            <RiskBadge prediction={prediction} probability={probability} />

            <div className="mt-6 bg-white p-6 rounded-lg shadow-md space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Tóm tắt Kết quả</h2>
                <p className="text-gray-700">{message}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-sm">⚠️ Thông báo Quan trọng</h3>
                <p className="text-gray-700 text-sm">
                  Dự đoán này dựa trên mô hình học máy và không nên được coi là chẩn đoán y tế. 
                  Vui lòng tư vấn với bác sĩ chuyên khoa để được đánh giá y tế chính xác.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="font-bold text-red-700 mb-2 text-sm">🏥 Hành động Khuyến nghị</h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Lên lịch khám với bác sĩ của bạn</li>
                  <li>• Làm xét nghiệm sàng lọc tiểu đường</li>
                  <li>• Tìm hiểu về phòng ngừa tiểu đường</li>
                  <li>• Theo dõi nồng độ đường huyết</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-bold text-green-700 mb-2 text-sm">💪 Lời Khuyên Sức Khỏe</h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Ăn uống lành mạnh, dinh dưỡng cân bằng</li>
                  <li>• Tập thể dục ít nhất 150 phút/tuần</li>
                  <li>• Duy trì cân nặng lành mạnh</li>
                  <li>• Kiểm tra sức khỏe thường xuyên</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-bold text-blue-700 mb-2 text-sm">💬 Trợ Lý AI</h3>
                <p className="text-gray-700 text-sm">
                  Bấm nút chat để mở AI assistant và nhận lời khuyên chi tiết!
                </p>
              </div>

              <div className="flex gap-3">
                <Link 
                  to="/history" 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm text-center"
                >
                  Lịch sử
                </Link>
                <Link 
                  to="/diagnosis" 
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm text-center"
                >
                  Tái chẩn đoán
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Healthcare Facilities Map (60%) */}
          <div className="w-3/5 flex-shrink-0">
            <HealthFacilitiesMap />
          </div>
        </div>
      )}
    </>
  )
}
