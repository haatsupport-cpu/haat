import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { cartService } from "../services/cart-service"
import { categoryService } from "../services/category-service"
import { productService } from "../services/product-service"
import {
  DEFAULT_CATEGORY_OPTIONS,
  getCategoryDisplayLabel,
  getCategoryId,
  getCategoryName,
  mergeCategoryOptions,
} from "../config/categories"
import { normalizeResponseArray } from "../utils/response"
import ProductCard from "../components/shared/ProductCard"
import LoginToOrderModal from "../components/shared/LoginToOrderModal"

export default function Products() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORY_OPTIONS)
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categoriesError, setCategoriesError] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const requestedCategory = searchParams.get("category")
    if (!requestedCategory) return

    const matchedCategory = categories.find(
      (category) => getCategoryName(category).trim().toLowerCase() === requestedCategory.trim().toLowerCase()
    )

    if (matchedCategory) {
      const matchedId = getCategoryId(matchedCategory)
      if (matchedId && matchedId !== selectedCategory) {
        setSelectedCategory(matchedId)
      }
    }
  }, [searchParams, categories, selectedCategory])

  useEffect(() => {
    fetchProducts(selectedCategory)
  }, [selectedCategory])

  const categoryTabs = useMemo(
    () => [{ id: "all", name: "All Products" }, ...categories.map((category) => ({ id: getCategoryId(category), name: getCategoryName(category) }))],
    [categories]
  )
  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return "all"
    const selected = categories.find((category) => getCategoryId(category) === selectedCategory)
    return selected ? getCategoryName(selected) : selectedCategory
  }, [selectedCategory, categories])
  const visibleProducts = useMemo(
    () => products.filter((product) => matchesSelectedCategory(product, selectedCategory, selectedCategoryName)),
    [products, selectedCategory, selectedCategoryName]
  )

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      setCategoriesError(null)
      const response = await categoryService.list()
      const apiCategories = normalizeResponseArray(response.data, ["categories", "data"])
      setCategories(mergeCategoryOptions(apiCategories))
    } catch {
      setCategories(DEFAULT_CATEGORY_OPTIONS)
      setCategoriesError("Unable to load categories.")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchProducts = async (categoryId = "all") => {
    try {
      setLoading(true)
      setError(null)
      const params = categoryId !== "all" ? { params: { category: categoryId } } : {}
      const response = await productService.list(params)
      setProducts(normalizeResponseArray(response.data, ["products", "data"]))
    } catch {
      setError("Unable to load products. Please try again later.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product, quantity) => {
    try {
      const userId = user?.id

      if (!userId) {
        setLoginModalOpen(true)
        return
      }

      await cartService.addItem({
        userId,
        productId: product.id || product._id,
        quantity,
      })

      const toast = document.createElement("div")

      toast.className =
        "fixed top-5 right-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium px-6 py-3.5 rounded-xl shadow-2xl z-50 backdrop-blur-md border border-white/20 transition-all duration-300"

      toast.innerText = `Added ${product.name} to cart`

      document.body.appendChild(toast)

      setTimeout(() => {
        toast.style.opacity = "0"
        setTimeout(() => toast.remove(), 300)
      }, 2000)
    } catch {
      alert("Could not add to cart")
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090a0f] relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative flex flex-col items-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-green-500 border-r-green-500/30 rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 font-medium tracking-wide text-sm animate-pulse uppercase">
            Loading Fresh Products
          </p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0f] px-6">
        <div className="max-w-md w-full bg-white/[0.02] backdrop-blur-xl border border-red-500/20 px-8 py-6 rounded-2xl shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-400 mb-4 text-xl">⚠️</div>
          <p className="text-gray-300 font-medium tracking-wide">{error}</p>
          <button
            onClick={() => fetchProducts(selectedCategory)}
            className="mt-5 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 antialiased relative selection:bg-green-500/30 selection:text-white pb-16">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[400px] left-0 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[130px] pointer-events-none" />

      <LoginToOrderModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* HEADER SECTION */}
      <header className="relative border-b border-white/[0.05] bg-black/[0.15] backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#2ab600] via-[#34d100] to-[#7dff5a] drop-shadow-[0_2px_10px_rgba(42,182,0,0.25)] animate-none">
              सबै Groceries, घर बसी बसी
            </h1>
          </div>

          {/* Desktop Categories Anchor */}
          <div className="hidden lg:flex items-center gap-2">
            {categoriesLoading && (
              <span className="text-xs text-gray-500 animate-pulse mr-2">Syncing categories...</span>
            )}
          </div>

          {/* Mobile Hamburger Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] active:scale-95 transition-all duration-200"
            aria-label="Toggle navigation categories"
          >
            <div className="w-5 h-4 flex flex-col justify-between relative">
              <span className={`w-full h-[2px] bg-gray-300 rounded-full transition-transform duration-300 origin-left ${mobileMenuOpen ? "rotate-45 translate-x-[2px] -translate-y-[1px]" : ""}`} />
              <span className={`w-full h-[2px] bg-gray-300 rounded-full transition-opacity duration-200 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-full h-[2px] bg-gray-300 rounded-full transition-transform duration-300 origin-left ${mobileMenuOpen ? "-rotate-45 translate-x-[2px] translate-y-[1px]" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Slide-Down Drawer */}
        <div className={`lg:hidden border-t border-white/[0.05] bg-[#0c0e14]/95 backdrop-blur-2xl overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-[500px] opacity-100 shadow-2xl" : "max-h-0 opacity-0 pointer-events-none"}`}>
          <div className="p-4 max-h-[400px] overflow-y-auto space-y-1.5 custom-scrollbar">
            {categoryTabs.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between text-sm font-medium ${isSelected
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/30 font-semibold"
                    : "bg-white/[0.02] text-gray-400 border-transparent hover:text-white"
                    }`}
                >
                  <span>{getCategoryDisplayLabel(category.name)}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#22c55e]" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* DESKTOP HORIZONTAL HORIZONTAL SCROLL CATEGORIES BAR */}
      <div className="hidden lg:block border-b border-white/[0.03] bg-black/[0.05] backdrop-blur-sm sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
            {categoryTabs.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2 rounded-full border transition-all duration-300 text-xs font-semibold uppercase tracking-wider whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-500/40 ${isSelected
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black border-transparent shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:brightness-110 transform scale-105"
                    : "bg-white/[0.03] text-gray-400 border-white/[0.05] hover:border-green-500/40 hover:text-white hover:bg-white/[0.06]"
                    }`}
                >
                  {getCategoryDisplayLabel(category.name)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CORE WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
        {categoriesError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center text-xs font-medium max-w-md mx-auto backdrop-blur-md">
            ⚠️ {categoriesError}
          </div>
        )}

        {/* Dynamic Category Heading / Layout Grid Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 border-l-2 border-green-500 pl-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              {selectedCategory === "all" ? "Explore Marketplace" : getCategoryDisplayLabel(selectedCategoryName)}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {visibleProducts.length} {visibleProducts.length === 1 ? 'item available' : 'items available'}
            </p>
          </div>
        </div>

        {/* PRODUCTS STREAM GRID */}
        {visibleProducts.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.01] backdrop-blur-md border border-white/[0.03] rounded-3xl max-w-xl mx-auto shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
            <div className="text-4xl md:text-5xl mb-4 opacity-40">📦</div>
            <h3 className="text-base font-semibold text-gray-300">No Inventory Found</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 px-4">
              We couldn't source any products matching this collection. Check back shortly for fresh restocking!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 items-stretch animate-fadeIn">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function matchesSelectedCategory(product, selectedCategoryId, selectedCategoryName) {
  if (selectedCategoryId === "all") return true

  const productCategoryId = String(product?.category_id || product?.categoryId || product?.category?._id || product?.category?.id || "")
  if (productCategoryId && productCategoryId === String(selectedCategoryId)) return true

  const productCategoryName = (
    product?.category?.name ||
    product?.category?.title ||
    product?.category?.category_name ||
    product?.category ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase()

  return productCategoryName && productCategoryName === String(selectedCategoryName).trim().toLowerCase()
}
