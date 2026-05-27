import { Link } from "react-router-dom"
import { motion as Motion } from "framer-motion"

export default function Home() {
  return (
    <div className="bg-[#f7faf7] text-gray-900 overflow-x-hidden">
      {/* HERO SECTION */}

      <section className="relative min-h-screen lg:min-h-0 overflow-hidden">
        {/* MOBILE BACKGROUND */}

        <div className="absolute inset-0 lg:hidden">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
            alt="Fresh groceries"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT */}

          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="inline-flex items-center bg-white/15 lg:bg-green-100 backdrop-blur-md lg:backdrop-blur-0 text-white lg:text-green-700 px-5 py-2 rounded-full text-sm font-semibold shadow-sm border border-white/20 lg:border-0">
              Fresh Groceries Delivered Across Hetauda
            </span>

            <h1 className="mt-6 flex flex-col space-y-2">
              <span className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-white lg:text-[#0f172a]">
                सबै Groceries,
              </span>

              <span className="pb-2 text-5xl md:text-6xl lg:text-7xl font-black leading-[1.15] tracking-tight bg-gradient-to-r from-lime-300 via-green-300 to-white lg:from-green-600 lg:via-green-500 lg:to-lime-400 bg-clip-text text-transparent">
                घर बसी बसी
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-200 lg:text-gray-600 max-w-xl leading-relaxed">
              Fresh groceries, fruits, vegetables,
              and daily essentials delivered across
              Hetauda.
            </p>

            

            <p className="mt-4 text-sm text-[#2ab600] lg:text-[#2ab600]">
              Fresh Daily • Fast Delivery • Easy Payments
            </p>

            {/* BUTTONS */}

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to="/products"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold"
              >
                Start Shopping
              </Link>

              <Link
                to="/about"
                className="bg-white/10 lg:bg-white backdrop-blur-md lg:backdrop-blur-0 border border-white/20 lg:border-gray-200 text-white lg:text-gray-800 hover:border-green-500 hover:text-green-700 px-8 py-4 rounded-2xl transition-all duration-300 font-medium shadow-sm"
              >
                Learn More
              </Link>
            </div>

            {/* STATS */}

            <div className="flex flex-wrap gap-6 mt-12">
              <div className="bg-white/10 lg:bg-white backdrop-blur-lg lg:backdrop-blur-0 px-5 py-4 rounded-2xl shadow-md border border-white/20 lg:border-gray-100">
                <h3 className="text-2xl font-black text-lime-300 lg:text-green-600">
                  Fresh
                </h3>

                <p className="text-sm text-gray-200 lg:text-gray-500">
                  Daily Groceries
                </p>
              </div>

              <div className="bg-white/10 lg:bg-white backdrop-blur-lg lg:backdrop-blur-0 px-5 py-4 rounded-2xl shadow-md border border-white/20 lg:border-gray-100">
                <h3 className="text-2xl font-black text-lime-300 lg:text-green-600">
                  Fast
                </h3>

                <p className="text-sm text-gray-200 lg:text-gray-500">
                  Local Delivery
                </p>
              </div>

              <div className="bg-white/10 lg:bg-white backdrop-blur-lg lg:backdrop-blur-0 px-5 py-4 rounded-2xl shadow-md border border-white/20 lg:border-gray-100">
                <h3 className="text-2xl font-black text-lime-300 lg:text-green-600">
                  Trusted
                </h3>

                <p className="text-sm text-gray-200 lg:text-gray-500">
                  Quality Products
                </p>
              </div>
            </div>
          </Motion.div>

          {/* RIGHT IMAGE */}

          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-300/20 to-lime-200/30 rounded-[3rem] blur-3xl" />

            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
              alt="Fresh groceries"
              className="relative z-10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.15)] w-full h-[520px] object-cover border border-white/40"
            />

            <div className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-lg px-5 py-3 rounded-2xl shadow-xl border border-white">
              <p className="font-bold text-gray-800">
               ⚡ 30 Min Delivery
              </p>
            </div>

            <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-lg px-5 py-3 rounded-2xl shadow-xl border border-white">
              <p className="font-bold text-gray-800">
                🥬 Fresh Everyday
              </p>
            </div>
          </Motion.div>
        </div>
      </section>
    </div>
  )
}
