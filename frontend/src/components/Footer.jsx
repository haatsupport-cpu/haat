import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-3">HaatOnline</h3>
          <p>Modern grocery shopping for Nepal.</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Links</h4>
          <nav className="flex flex-col gap-2">
            <Link
              to="/products"
              className="hover:text-white transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              to="/login"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <p>Kathmandu, Nepal</p>
          <p>support@haatonline.com</p>
        </div>
      </div>
    </footer>
  )
}
