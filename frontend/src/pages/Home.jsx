import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { ShoppingBasket, Truck, Leaf, Wallet } from "lucide-react"

import { useAuth } from "../context/useAuth"
import { axiosClient } from "../utils/axiosClient"
import LoginToOrderModal from "../components/LoginToOrderModal"


const categories = [
  {
    name: "Vegetables",
    emoji: "🥦",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Fruits",
    emoji: "🍎",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Dairy",
    emoji: "🥛",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Snacks",
    emoji: "🍪",
    image:
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Beverages",
    emoji: "🧃",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1200&auto=format&fit=crop",
  },

  {
    name: "Meat",
    emoji: "🍖",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=1200&auto=format&fit=crop",
    description: "Chicken • Mutton • Buff • Pork",
  },
]


  //  FEATURES


const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Lightning Delivery",
    desc: "Groceries delivered within hours.",
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Farm Fresh",
    desc: "Direct sourcing from local farmers.",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Best Prices",
    desc: "Affordable daily essentials.",
  },
]

const PLACEHOLDER_IMG =
  "https://placehold.co/400x250/78716c/f5f5f4?text=Product+Image"

// HOME PAGE - LANDING PAGE

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
const response = await axiosClient.get("/api/products")

        const list = Array.isArray(response.data) ? response.data : []
        setFeaturedProducts(list.slice(0, 6))
      } catch {
        setFeaturedProducts([])
      }
    }

    fetchProducts()
  }, [])

  const { user } = useAuth()

  const handleAddToCart = async (product) => {
    try {
      const userId = user?.id

      if (!userId) {
        setLoginModalOpen(true)
        return
      }

      await axiosClient.post(`/api/cart`, {
        userId,
        productId: product.id || product._id,
        quantity: 1,
      })

      const toast = document.createElement("div")
      toast.className =
        "fixed top-5 right-5 bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl z-50 animate-pulse"
      toast.innerText = `Added ${product.name} to cart`
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 2000)
    } catch {
      alert("Could not add to cart")
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 text-gray-900 overflow-x-hidden">
      <LoginToOrderModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <section className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
        <Motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            Nepal’s Digital Haat Bazaar
          </span>

          <h1 className="text-5xl lg:text-7xl font-black mt-6 leading-tight">
            Fresh Groceries
            <span className="block bg-gradient-to-r from-green-600 to-lime-400 bg-clip-text text-transparent">
              Delivered Instantly
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Order vegetables, fruits and daily groceries from trusted local sellers.
          </p>

          <div className="flex gap-4 mt-8">
            <Link
              to="/products"
              className="bg-green-600 text-white px-7 py-3 rounded-2xl shadow-xl hover:scale-105 transition"
            >
              Start Shopping
            </Link>

            <Link to="/about" className="border px-7 py-3 rounded-2xl hover:border-green-600">
              Learn More
            </Link>
          </div>
        </Motion.div>

        <Motion.img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
          alt="Fresh groceries"
          className="rounded-[2rem] shadow-2xl w-full object-cover"
        />
        <div className="absolute -top-6 -right-6 bg-lime-300 px-4 py-2 rounded-xl shadow-lg font-semibold">
          ⚡ 30 min Delivery
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 overflow-hidden">
        <div className="flex justify-between mb-10">
          <h2 className="text-3xl font-bold">Shop By Category</h2>

          <Link to="/products" className="text-green-600 font-semibold">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 min-w-max pb-4">
            {categories.map((cat, i) => (
              <Motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative w-[240px] h-[320px] rounded-[2rem] overflow-hidden shadow-xl flex-shrink-0 group cursor-pointer"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "https://placehold.co/400x400?text=Category"
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-2xl font-bold flex gap-2">
                    <span>{cat.emoji}</span>
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="text-xs opacity-80 mt-1">{cat.description}</p>
                  )}
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Popular Picks 🔥</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((p) => (
            <div
              key={p.id || p._id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              <img
                src={p.imageUrl || p.image || PLACEHOLDER_IMG}
                alt={p.name}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMG
                }}
                className="h-60 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="font-bold text-lg">{p.name}</h3>

                <p className="text-green-700 font-semibold">
                  Rs. {Number(p.price ?? 0).toFixed(2)}
                </p>

                <button
                  onClick={() => handleAddToCart(p)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white/70 rounded-3xl p-8 shadow-lg text-center"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-lime-400 text-white flex items-center justify-center rounded-2xl mx-auto mb-4">
              {f.icon}
            </div>

            <h3 className="font-bold text-xl mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-green-600 to-lime-400 text-white rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold"> Free Delivery On First Order 🚚 </h2>
          <p className="mt-4 opacity-90">
            Join thousands of happy shoppers using HaatOnline.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-white text-green-700 px-7 py-3 rounded-xl font-semibold"
          >
            Shop Now
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="bg-[#023048] text-white rounded-3xl p-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold">HaatOnline App 📱</h2>
            <p className="opacity-80 mt-2">Launching Soon</p>
          </div>
        </div>
      </section>
    </div>
  )
}
