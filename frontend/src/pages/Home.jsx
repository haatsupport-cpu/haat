import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Truck,
  Leaf,
  Wallet,
  ArrowRight,
  ShoppingBasket,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Truck className="w-7 h-7" />,
      title: "Fast Delivery",
      description:
        "Fresh groceries delivered to your doorstep quickly.",
    },
    {
      icon: <Leaf className="w-7 h-7" />,
      title: "Local & Fresh",
      description:
        "Support local farmers with high-quality fresh produce.",
    },
    {
      icon: <Wallet className="w-7 h-7" />,
      title: "Affordable Prices",
      description:
        "Best quality products at prices everyone can afford.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#f8faf7] text-gray-900 overflow-x-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute top-[-120px] left-[-120px] w-72 h-72 md:w-96 md:h-96 bg-green-200/30 blur-3xl rounded-full" />

      <div className="pointer-events-none absolute bottom-[-150px] right-[-150px] w-80 h-80 md:w-[30rem] md:h-[30rem] bg-lime-200/30 blur-3xl rounded-full" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-14 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
              
              Nepal’s Digital Haat Bazaar
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6">
              Fresh Groceries,
              <span className="block text-green-600">
                Delivered Fast.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mb-8">
              Shop fresh vegetables, fruits, groceries, and local
              products directly from trusted sellers in your area.
              Experience your traditional Haat Bazaar — now online.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-105"
              >
                Start Shopping

                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-gray-300 hover:border-green-500 hover:text-green-700 bg-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-sm"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 sm:gap-12 mt-12">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-700">
                  5K+
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Happy Customers
                </p>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-700">
                  100+
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Local Sellers
                </p>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-700">
                  24/7
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Online Support
                </p>
              </div>
            </div>
          </Motion.div>

          {/* Right Hero Section */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] p-4 sm:p-6 lg:p-8">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
                alt="Fresh groceries"
                className="rounded-3xl h-[280px] sm:h-[350px] lg:h-[420px] w-full object-cover shadow-lg"
              />

              {/* Floating Badge */}
              <div className="absolute -bottom-4 left-6 sm:left-10 bg-white shadow-xl rounded-2xl px-5 py-4 border border-gray-100">
                <p className="text-sm text-gray-500">
                  Today’s Fresh Picks
                </p>

                <h4 className="font-bold text-base sm:text-lg text-green-700">
                  Organic Vegetables 🌱
                </h4>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-28">
          {features.map((feature, index) => (
            <Motion.div
              key={index}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white/70 backdrop-blur-lg border border-white/50 rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-lime-400 text-white flex items-center justify-center mb-5 shadow-md">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-gray-800">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </Motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}