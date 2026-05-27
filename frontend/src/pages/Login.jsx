import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";

import { authService } from "../services/auth-service";
import { setAuthToken } from "../services/api";
import { useAuth } from "../context/useAuth";

import groceryImg from "../assets/grocery1.png";
import logoImg from "../assets/logobg.png";

export default function Login() {
  const [phoneno, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, loading: authLoading, setUser } = useAuth();
  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role === "admin") navigate("/admin");
    else navigate("/products");
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ phoneno, password });
      const user = response.data?.user;
      const token = response.data?.token;
      if (!user || !token) {
        throw new Error("Login failed");
      }

      setAuthToken(token);
      setUser(user);
      if (user.role === "admin") navigate("/admin");
      else navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  

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
              Fresh groceries delivered to your doorstep.
            </Motion.h2>

            <p className="text-lg text-green-50/90 leading-relaxed">
              Order vegetables, fruits, groceries, and local products directly
              from your trusted Haat Bazaar.
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
              <p className="text-sm text-green-100">Fast Support</p>
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
                Welcome Back 👋
              </h2>
              <p className="text-gray-500">
                Login to continue shopping fresh groceries.
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
                  Phone Number
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="phoneno"
                    placeholder="98XXXXXXXX"
                    value={phoneno}
                    onChange={(e) => setPhone(e.target.value)}
                    required
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
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    Login
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

           

            <p className="mt-8 text-center text-gray-500">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Create Account
              </Link>
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
  
}
