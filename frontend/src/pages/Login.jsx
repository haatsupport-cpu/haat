import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { authService } from "../utils/auth"
import groceryImg from "../assets/grocery1.png"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      })

      // Save token and user info
      authService.setAuth(response.data.token, response.data.user)

      // Redirect based on user role
      if (response.data.user.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/products")
      }
    } catch (err) {
      setError(
        err.response?.data?.msg || "Login failed. Please check your credentials."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen bg-white-100">
      {/* Left Image Panel */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${groceryImg})` }}
      >
        <div className="w-full p-10 text-center">
          <h1 className="text-green-600 text-3xl font-extrabold px-4">
            Fresh groceries delivered to your doorstep
          </h1>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-10">
        {/* Card */}
        <div className="bg-white p-16 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-green-600 mb-8 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-500 font-semibold hover:text-green-600 hover:underline transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
