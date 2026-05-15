import { useState } from "react"

const PLACEHOLDER =
  "https://placehold.co/400x250/78716c/f5f5f4?text=Product+Image"

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)

  const handleUpdateQuantity = (change) => {
    setQuantity((prev) => Math.max(1, prev + change))
  }

  const handleAction = () => {
    onAddToCart(product, quantity)
    setQuantity(1)
  }

  const priceNum = Number(product.price ?? 0)

  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white hover:border-green-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative">
      {product.tag && (
        <div
          className={`absolute top-3 right-3 ${
            product.tag === "Fresh"
              ? "bg-green-500"
              : product.tag === "Packaged"
                ? "bg-yellow-400 text-black"
                : "bg-gray-700"
          } text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg`}
        >
          {product.tag.toUpperCase()}
        </div>
      )}

      <div className="h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={
            product.imageUrl ||
            product.image ||
            "https://placehold.co/400x250?text=No+Image"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = PLACEHOLDER
          }}
        />
      </div>

      <div className="p-5">
        <h2 className="text-lg font-bold text-gray-800 leading-tight">
          {product.name}
        </h2>

        <div className="flex items-end gap-2 mt-2 mb-4">
          <p className="text-2xl font-extrabold text-green-600">
            Rs. {priceNum.toFixed(2)}
          </p>
          <span className="text-sm text-gray-500">
            /{product.unit || "kg"}
          </span>
        </div>

        <div className="flex items-center justify-between mb-5 px-4 py-2 border border-gray-200 rounded-2xl bg-gray-50/70 backdrop-blur">
          <label className="text-sm font-medium text-gray-600">Qty</label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleUpdateQuantity(-1)}
              disabled={quantity === 1}
              className="w-8 h-8 rounded-full hover:bg-green-100 text-green-700 font-bold transition disabled:opacity-40"
            >
              −
            </button>

            <span className="w-6 text-center font-semibold">{quantity}</span>

            <button
              type="button"
              onClick={() => handleUpdateQuantity(1)}
              className="w-8 h-8 rounded-full hover:bg-green-100 text-green-700 font-bold transition"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAction}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:shadow-green-200 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>🛒 Add to Cart</span>
        </button>
      </div>
    </div>
  )
}
