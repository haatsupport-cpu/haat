import { useState } from "react"
import { resolveAssetUrl } from "../../services/api"

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
  const categoryLabel =
    product?.category?.name ||
    product?.category?.title ||
    product?.category?.category_name ||
    product?.category ||
    "Uncategorized"

  // Structural mapping for badge design mechanics
  const isFresh = product.tag === "Fresh"
  const isPackaged = product.tag === "Packaged"

  return (
    <div className="group bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.05] hover:border-green-500/30 shadow-xl hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-500 flex flex-col justify-between overflow-hidden relative transform hover:-translate-y-1 w-full h-full min-w-0">
      {/* Absolute Header Overlay Glow */}
      <div className="absolute top-0 inset-x-0 h-[80px] bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        {/* Dynamic Tag Management */}
        {product.tag && (
          <div
            className={`absolute top-2.5 right-2.5 z-10 text-[9px] font-black tracking-widest uppercase py-1 px-2.5 rounded-md shadow-lg ${
              isFresh
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                : isPackaged
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                  : "bg-gray-800 text-gray-300 border border-white/10"
            }`}
          >
            {product.tag}
          </div>
        )}

        {/* Card Media Wrapper */}
        <div className="h-32 sm:h-36 md:h-40 w-full overflow-hidden bg-black/20 border-b border-white/[0.03] relative">
          <img
            src={
              resolveAssetUrl(product.imageUrl || product.image) ||
              "https://placehold.co/400x250?text=No+Image"
            }
            alt={product.name}
            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out select-none"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = PLACEHOLDER
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
        </div>

        {/* Content Details Block */}
        <div className="p-3.5 sm:p-4">
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider block mb-1 truncate opacity-90">
            {categoryLabel}
          </span>
          
          <h3 className="text-xs sm:text-sm font-bold text-gray-100 tracking-tight leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-white transition-colors duration-200">
            {product.name}
          </h3>

          {/* Pricing Alignment Component */}
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-200">
              Rs. {priceNum.toFixed(2)}
            </span>
            <span className="text-[10px] font-medium text-gray-400">
              /{product.unit || "kg"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Deck (Stays Anchored To Base) */}
      <div className="p-3.5 sm:p-4 pt-0 mt-auto space-y-2.5">
        {/* Quantity Management Block */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border border-white/[0.05] rounded-xl bg-white/[0.01] backdrop-blur-md">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Qty</span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleUpdateQuantity(-1)}
              disabled={quantity === 1}
              className="w-6 h-6 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.05] hover:border-white/[0.1] text-gray-300 font-bold transition disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center text-xs focus:outline-none focus:ring-1 focus:ring-green-500/40"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span className="w-5 text-center text-xs font-bold text-white select-none">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => handleUpdateQuantity(1)}
              className="w-6 h-6 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.05] hover:border-white/[0.1] text-gray-300 font-bold transition flex items-center justify-center text-xs focus:outline-none focus:ring-1 focus:ring-green-500/40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleAction}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg shadow-green-950/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group/btn focus:outline-none focus:ring-2 focus:ring-green-500/40"
        >
          <span className="transform group-hover/btn:translate-x-0.5 transition-transform duration-300">🛒 Add to Cart</span>
        </button>
      </div>
    </div>
  )
}
