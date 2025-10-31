import { Link } from "react-router-dom"

import groceryImg from "../assets/grocery1.png"

export default function Login() {
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

          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
              />
            </div>

            <button
              type="submit"
              // Changed button color to Mint Green
              className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200 ease-in-out transform hover:-translate-y-0.5"
            >
              Login
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
