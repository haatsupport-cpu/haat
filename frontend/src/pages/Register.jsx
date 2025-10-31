import { Link } from "react-router-dom"
import groceryImg from "../assets/grocery1.png"

export default function Register() {
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
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white-100 p-8">
        <div className="bg-white p-16 rounded-2xl shadow-2xl w-full max-w-md transform transition duration-300 hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-green-600 mb-8 text-center">
            Sign Up
          </h2>

          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
