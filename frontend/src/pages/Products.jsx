import { useState, useEffect } from "react"
import axios from "axios"
import { authService } from "../utils/auth"

const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)

  const handleUpdateQuantity = (change) => {
    setQuantity((prev) => Math.max(1, prev + change))
  }

  const handleAction = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
  }

  return (
    <div
      key={product._id}
      className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 hover:border-green-400 transition duration-300 transform hover:scale-[1.02] relative"
    >
      {/* Tag */}
      {product.tag && (
        <div
          className={`absolute top-0 right-0 ${
            product.tag === "Fresh"
              ? "bg-green-600"
              : product.tag === "Packaged"
              ? "bg-yellow-500"
              : "bg-gray-600"
          } text-white text-xs font-bold py-1 px-3 rounded-bl-lg shadow-lg`}
        >
          {product.tag.toUpperCase()}
        </div>
      )}

      {/* Image */}
      <div className="h-40 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
        <img
          src={product.image || "https://placehold.co/400x250?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null
            e.target.src =
              "https://placehold.co/400x250/78716c/f5f5f4?text=Product+Image"
          }}
        />
      </div>

      {/* Product Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-blue-800 leading-tight">
            {product.name}
          </h2>
        </div>

        <p className="text-3xl font-extrabold text-green-600 mb-4">
          Rs. {product.price?.toFixed(2)}
          <span className="text-sm font-medium text-gray-500 ml-1">
            /{product.unit}
          </span>
        </p>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4 p-2 border border-gray-300 rounded-lg bg-gray-50">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => handleUpdateQuantity(-1)}
              className="text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
              disabled={quantity === 1}
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-lg">
              {quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(1)}
              className="text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAction}
          className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200 ease-in-out flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus-circle"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/api/products")
        setProducts(response.data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Unable to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (product, quantity) => {
    try {
      const userId = authService.getUserId()
      if (!userId) {
        alert("Please login to add items to cart")
        window.location.href = "/login"
        return
      }

      await axios.post("http://localhost:5000/api/cart", {
        userId,
        productId: product._id,
        quantity,
      })

      // Notification
      const message = `Added ${product.name} to your cart!`
      const feedbackBox = document.createElement("div")
      feedbackBox.className =
        "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl z-50 transition duration-500 ease-in-out transform translate-x-full opacity-0"
      feedbackBox.textContent = message
      document.body.appendChild(feedbackBox)

      setTimeout(() => {
        feedbackBox.classList.remove("translate-x-full", "opacity-0")
        feedbackBox.classList.add("translate-x-0", "opacity-100")
      }, 10)

      setTimeout(() => {
        feedbackBox.classList.remove("translate-x-0", "opacity-100")
        feedbackBox.classList.add("translate-x-full", "opacity-0")
        setTimeout(() => feedbackBox.remove(), 500)
      }, 2000)
    } catch (err) {
      console.error("Failed to add to cart:", err)
      alert("Could not add to cart. Please try again.")
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-green-800 font-bold text-2xl">
        Loading products...
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold text-lg">
        {error}
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-green-800 mb-2">
          HaatOnline
        </h1>
        <p className="text-xl text-gray-600">Haat Bazar, Now Online!</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  )
}
