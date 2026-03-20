export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">About Us</h3>
            <p className="text-gray-300">
              Diabetes Diagnosis App helps you assess your diabetes risk.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="text-gray-300">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/articles" className="hover:text-white">Articles</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-300">Email: info@diabetesapp.com</p>
            <p className="text-gray-300">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <hr className="my-8 border-gray-700" />
        <p className="text-center text-gray-300">
          © 2024 Diabetes Diagnosis App. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
