import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"

export default function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth()

  return (
    <nav className="bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold">
        HaatOnline
      </Link>

      <div className="flex space-x-4 items-center">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/products" className="hover:underline">
          Products
        </Link>
        <Link to="/cart" className="hover:underline">
          Cart
        </Link>

        {/* Show Dashboard only if admin */}
        {isLoggedIn && isAdmin && (
          <Link to="/admin" className="hover:underline">
            Dashboard
          </Link>
        )}

        {/* Show Login only if NOT logged in */}
        {!isLoggedIn && (
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        )}

        {/* Show Logout if logged in */}
        {isLoggedIn && (
          <button
            onClick={logout}
            className="hover:underline bg-white text-green-600 px-2 py-1 rounded font-semibold"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
