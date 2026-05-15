import { useState, useEffect } from "react"
import { useAuth } from "../context/useAuth"
import { axiosClient } from "../utils/axiosClient"
import ProductCard from "../components/ProductCard"
import LoginToOrderModal from "../components/LoginToOrderModal"

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get(`/api/products`)
        setProducts(response.data)
      } catch {
        setError("Unable to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (product, quantity) => {
    try {
      const userId = user?.id

      if (!userId) {
        setLoginModalOpen(true)
        return
      }

      await axiosClient.post(`/api/cart`, {
        userId,
        productId: product.id || product._id,
        quantity,
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

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8faf7] via-white to-lime-50">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-green-700 font-semibold text-lg">
          Loading fresh products...
        </p>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf7] via-white to-lime-50">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl shadow-lg">
          {error}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 p-6 md:p-10">
      <LoginToOrderModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <div className="text-center mb-14">
        <h1 className="text-5xl font-black text-green-700 tracking-tight">
          HaatOnline 🛒
        </h1>
        <p className="text-lg text-gray-600 mt-2">Haat Bazar, Now Online!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {products.map((product) => (
          <ProductCard
            key={product.id || product._id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  )
}
