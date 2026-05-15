import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import logoImg from "../assets/logo1.png";

export default function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logoImg}
            alt="HaatOnline"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base font-medium">

          <Link
            to="/"
            className="hover:text-green-700 transition"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="hover:text-green-700 transition"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="hover:text-green-700 transition"
          >
            Cart
          </Link>

          {isLoggedIn && isAdmin && (
            <Link
              to="/admin"
              className="hover:text-green-700 transition"
            >
              Dashboard
            </Link>
          )}

          {!isLoggedIn ? (
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-md transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-md transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}