export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Về chúng tôi</h3>
            <p className="text-gray-300">
              Ứng dụng Chẩn đoán Tiểu đường giúp bạn đánh giá nguy cơ tiểu đường.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="text-gray-300">
              <li><a href="/" className="hover:text-white">Trang chủ</a></li>
              <li><a href="/articles" className="hover:text-white">Bài viết</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <p className="text-gray-300">Email: info@diabetesapp.com</p>
            <p className="text-gray-300">Điện thoại: +1 (555) 123-4567</p>
          </div>
        </div>
        <hr className="my-8 border-gray-700" />
        <p className="text-center text-gray-300">
          © 2024 Ứng dụng Chẩn đoán Tiểu đường. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  )
}
