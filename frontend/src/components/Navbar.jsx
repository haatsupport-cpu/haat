import { Link } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-black text-green-700"
        >
          <div className="bg-green-600 text-white p-2 rounded-xl shadow-md">
            <ShoppingBasket className="w-5 h-5" />
          </div>

          <span>HaatOnline</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-3 sm:gap-5 text-sm sm:text-base font-medium">
          <Link
            to="/"
            className="hover:text-green-700 transition-colors duration-200"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="hover:text-green-700 transition-colors duration-200"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="hover:text-green-700 transition-colors duration-200"
          >
            Cart
          </Link>

          {/* Admin Dashboard */}
          {isLoggedIn && isAdmin && (
            <Link
              to="/admin"
              className="hover:text-green-700 transition-colors duration-200"
            >
              Dashboard
            </Link>
          )}

          {/* Login */}
          {!isLoggedIn && (
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-md"
            >
              Login
            </Link>
          )}

          {/* Logout */}
          {isLoggedIn && (
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-md"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}