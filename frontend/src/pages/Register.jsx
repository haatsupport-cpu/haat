import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from "lucide-react"

import { supabase } from "../supabaseClient"

import groceryImg from "../assets/grocery1.png"
import logoImg from "../assets/logo.png"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  // role-based redirect is handled inside gotoByRole()

  const gotoByRole = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return navigate("/login")

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()

    if (profileErr) return navigate("/products")
    if (profile?.role === "admin") navigate("/admin")
    else navigate("/products")
  }

  // Email/Password Register
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      if (!name) return setError("Name is required")
      if (!phone) return setError("Phone is required")

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            provider: "local",
          },
        },
      })

      if (signUpErr) throw signUpErr

      if (data.session) {
        await gotoByRole()
      } else {
        setError(
          "Check your email to confirm your account, then log in."
        )
      }
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Google Register/Login (OAuth)
  
  const handleGoogleSignup = async () => {
    try {
      setError("")
      setLoading(true)

      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      })

      if (oauthErr) throw oauthErr

    } catch (err) {
      setError(err?.message || "Google signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf7] overflow-hidden">
      <div className="hidden lg:flex relative w-1/2 overflow-hidden">
        <img
          src={groceryImg}
          alt="Fresh Groceries"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/70 to-black/60" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-lime-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-14 text-white w-full">
          <div className="flex items-center w-full">
            <img
              src={logoImg}
              alt="HaatOnline"
              className="h-20 w-auto sm:h-24 md:h-28 lg:h-32 max-w-full object-contain object-left drop-shadow-lg"
            />
          </div>

          <div className="max-w-lg">
            <Motion.h2
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-5xl font-black leading-tight mb-6"
            >
              Join Nepal’s modern online Haat Bazaar.
            </Motion.h2>

            <p className="text-lg text-green-50/90 leading-relaxed">
              Fresh vegetables, groceries, and local products delivered quickly
              from trusted local sellers.
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <h3 className="text-3xl font-bold">5K+</h3>
              <p className="text-sm text-green-100">Happy Customers</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">100+</h3>
              <p className="text-sm text-green-100">Local Sellers</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold">24/7</h3>
              <p className="text-sm text-green-100">Fast Delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200/30 blur-3xl rounded-full" />

        <Motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2rem] p-8 md:p-10">
            <div className="lg:hidden flex justify-center mb-6 px-2">
              <img
                src={logoImg}
                alt="HaatOnline"
                className="h-20 w-auto max-w-[min(100%,20rem)] sm:h-24 object-contain"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-gray-800 mb-3">
                Create Account 🚀
              </h2>
              <p className="text-gray-500">
                Sign up to start shopping fresh groceries.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    pattern="^(97|98)[0-9]{8}$"
                    title="Enter valid Nepali number"
                    maxLength={10}
                    minLength={10}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="border-t border-gray-200" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-sm text-gray-400">
                OR
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-green-400 py-4 rounded-2xl font-medium text-gray-700 transition-all duration-300 bg-white hover:bg-green-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <p className="mt-8 text-center text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Login
              </Link>
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  )
}
