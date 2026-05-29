import BillPreview from "../components/checkout-temp/BillPreview.jsx";
import { useEffect, useMemo, useState } from "react"
import { motion as Motion } from "framer-motion"
import { adminService } from "../services/admin-service"
import { categoryService } from "../services/category-service"
import { productService } from "../services/product-service"
import { orderService } from "../services/order-service"
import { resolveAssetUrl } from "../services/api"
import { storageService } from "../services/storage-service"
import AnalyticsCharts from "../components/charts/AnalyticsCharts"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import StatCard from "../components/ui/StatCard"
import {
  DEFAULT_CATEGORY_OPTIONS,
  getCategoryDisplayLabel,
  getCategoryId,
  getCategoryName,
  getProductCategoryId,
  getProductCategoryLabel,
  mergeCategoryOptions,
} from "../config/categories"
import {
  PRODUCT_FORM_INITIAL,
  getUploadErrorMessage,
  orderPaymentOptions,
  orderStatusOptions,
  sidebarItems,
  validateImageFile,
} from "../config/admin-dashboard.jsx"
import { normalizeResponseArray } from "../utils/response"
import { formatCurrency, formatDate, getPaymentLabel, getStatusLabel } from "../utils/formatters"
import {
  ArrowDown,
  ArrowUp,
  Edit,
  LogOut,
  Menu,
  Plus,
  Package,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0, productCount: 0, customerCount: 0 })
  const [chartData, setChartData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [productCategory, setProductCategory] = useState("all")
  const [orderSearch, setOrderSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(PRODUCT_FORM_INITIAL)
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState("")
  const [promos, setPromos] = useState([])
  const [promoForm, setPromoForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderValue: "",
    expiryDate: "",
    activeStatus: true,
  })
  const [editingPromo, setEditingPromo] = useState(null)
  const [promoStatus, setPromoStatus] = useState("")
  const [popupAds, setPopupAds] = useState([])
  const [popupForm, setPopupForm] = useState({
    title: "",
    textContent: "",
    imageUrl: "",
    targetLink: "",
    isActive: false,
    imageFile: null,
    imagePreview: "",
    imageError: "",
  })
  const [editingPopup, setEditingPopup] = useState(null)
  const [popupStatus, setPopupStatus] = useState("")

  useEffect(() => {
    fetchDashboardData()
    fetchCategories()
    const onPlanned = (e) => {
      try {
        const planned = e.detail || [];
        if (Array.isArray(planned) && planned.length > 0) setOrders(planned);
      } catch {
        setOrders([])
      }
    };
    window.addEventListener("admin:routePlanned", onPlanned);
    return () => window.removeEventListener("admin:routePlanned", onPlanned);
  }, [])

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts()
    } else if (activeTab === "orders") {
      fetchOrders()
    } else if (activeTab === "customers") {
      fetchCustomers()
    } else if (activeTab === "dashboard") {
      fetchDashboardData()
    } else if (activeTab === "promos") {
      fetchPromos()
    } else if (activeTab === "popups") {
      fetchPopupAds()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      const statsRes = await adminService.getStats()
      const ordersRes = await adminService.getRecentOrders()
      const ordersData = normalizeResponseArray(ordersRes.data, ["orders", "data"])

      setStats({
        totalSales: statsRes.data?.totalSales ?? 0,
        orderCount: statsRes.data?.orderCount ?? 0,
        productCount: statsRes.data?.productCount ?? 0,
        customerCount: statsRes.data?.customerCount ?? 0,
      })

      setChartData(createTrendData(statsRes.data?.analyticsTrend, ordersData))
      setRecentOrders(ordersData)
    } catch (error) {
      console.error("Dashboard fetch failed", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.list()
      setProducts(normalizeResponseArray(response.data, ["products", "data"]))
    } catch (error) {
      console.error("Products fetch failed", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      setCategoriesError("")
      const response = await categoryService.list()
      const apiCategories = normalizeResponseArray(response.data, ["categories", "data"])
      setCategoryOptions(mergeCategoryOptions(apiCategories))
    } catch (error) {
      console.error("Categories fetch failed", error)
      setCategoryOptions(DEFAULT_CATEGORY_OPTIONS)
      setCategoriesError("Unable to load categories. Please retry.")
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.list()
      setOrders(normalizeResponseArray(response.data, ["orders", "data"]))
    } catch (error) {
      console.error("Orders fetch failed", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Parse stored location string of form:
  // Lat:12.345678,Lng:78.123456|Label:Home|Address:Some addr|Landmark:LM
  const parseLocationString = (s) => {
    if (!s || typeof s !== "string") return { lat: 27.42949558266496, lng: 85.03280181607856 };
    try {
      const parts = s.split("|");
      const out = {};
      parts.forEach((p) => {
        const [k, ...rest] = p.split(":");
        const val = rest.join(":");
        if (!k) return;
        const key = k.trim();
        if (key === "Lat") {
          out.lat = Number(val.split(",")[0]);
        } else if (key === "Lng") {
          out.lng = Number(val);
        } else if (key === "Label") {
          out.label = val;
        } else if (key === "Address") {
          out.address = val;
        } else if (key === "Landmark") {
          out.landmark = val;
        }
      });
      // Also attempt to parse combined Lat/Lng pattern
      if ((!out.lat || !out.lng) && s.includes("Lat:")) {
        const m = s.match(/Lat:([-0-9.]+),Lng:([-0-9.]+)/);
        if (m) {
          out.lat = Number(m[1]);
          out.lng = Number(m[2]);
        }
      }
      // Fallback to default if missing
      if (!out.lat || !out.lng) {
        out.lat = 27.42949558266496;
        out.lng = 85.03280181607856;
      }
      // TEMP DEBUG LOG
      console.log("[AdminDashboard] parseLocationString", out);
      return out;
    } catch {
      return { lat: 27.42949558266496, lng: 85.03280181607856 };
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await adminService.getCustomers()
      setCustomers(normalizeResponseArray(response.data, ["customers", "data"]))
    } catch (error) {
      console.error("Customers fetch failed", error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    const imageUrl = await uploadProductImage()
    if (imageUrl === null) return
    try {
      const payload = {
        name: productForm.name,
        category_id: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
        unit: productForm.unit || "kg",
        tag: productForm.tag || "",
        description: productForm.tag || "",
        image_url: imageUrl,
        is_active: true,
      }
      await productService.create(payload)
      setShowAddProductModal(false)
      resetProductForm()
      fetchProducts()
      fetchDashboardData()
    } catch (error) {
      console.error("Add product failed", error)
      alert("Unable to add product. Please try again.")
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    const imageUrl = await uploadProductImage()
    if (imageUrl === null) return
    try {
      const payload = {
        name: productForm.name,
        category_id: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
        unit: productForm.unit || "kg",
        tag: productForm.tag || "",
        description: productForm.tag || "",
        image_url: imageUrl,
        is_active: true,
      }
      await productService.update(editingProduct._id, payload)
      setShowAddProductModal(false)
      setEditingProduct(null)
      resetProductForm()
      fetchProducts()
    } catch (error) {
      console.error("Update product failed", error)
      alert("Unable to update product. Please try again.")
    }
  }

  const handleDeleteProduct = async (id) => {
    const confirmed = confirm("Delete this product permanently?")
    if (!confirmed) return

    try {
      await productService.remove(id)
      fetchProducts()
      fetchDashboardData()
    } catch (error) {
      console.error("Delete product failed", error)
      alert("Unable to delete product. Please try again.")
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name || "",
      category: getProductCategoryId(product),
      price: product.price ?? "",
      stock: product.stock ?? "",
      unit: product.unit || "",
      tag: product.tag || "",
      image: product.image || product.imageUrl || "",
      imageFile: null,
      imagePreview: "",
      imageError: "",
    })
    setShowAddProductModal(true)
  }

  const resetPromoForm = () => {
    setEditingPromo(null)
    setPromoForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrderValue: "",
      deliveryOptions: ["instant", "scheduled"],
      expiryDate: "",
      activeStatus: true,
    })
  }

  const handleSubmitPromo = async (e) => {
    e.preventDefault()
    setPromoStatus("")

    try {
      const payload = {
        ...promoForm,
        discountValue: Number(promoForm.discountValue),
        minimumOrderValue: Number(promoForm.minimumOrderValue || 0),
      }
      if (editingPromo) {
        await adminService.updatePromo(editingPromo.id || editingPromo._id, payload)
        setPromoStatus("Promo code updated")
      } else {
        await adminService.createPromo(payload)
        setPromoStatus("Promo code created")
      }
      resetPromoForm()
      fetchPromos()
    } catch (error) {
      setPromoStatus(error.response?.data?.message || "Unable to save promo code")
    }
  }

  const handleEditPromo = (promo) => {
    setEditingPromo(promo)
    setPromoForm({
      code: promo.code || "",
      discountType: promo.discountType || "percentage",
      discountValue: promo.discountValue ?? "",
      minimumOrderValue: promo.minimumOrderValue ?? promo.minOrderAmount ?? "",
      deliveryOptions: promo.deliveryOptions ?? promo.deliveryType ? (promo.deliveryType === "instant" ? ["instant"] : ["instant", "scheduled"]) : ["instant", "scheduled"],
      expiryDate: promo.expiryDate ? new Date(promo.expiryDate).toISOString().slice(0, 10) : "",
      activeStatus: Boolean(promo.activeStatus ?? promo.isActive),
    })
  }

  const handleDeletePromo = async (promo) => {
    if (!confirm(`Delete promo code ${promo.code}?`)) return
    try {
      await adminService.deletePromo(promo.id || promo._id)
      setPromoStatus("Promo code deleted")
      fetchPromos()
    } catch (error) {
      setPromoStatus(error.response?.data?.message || "Unable to delete promo code")
    }
  }

  const resetPopupForm = () => {
    if (popupForm.imagePreview) URL.revokeObjectURL(popupForm.imagePreview)
    setEditingPopup(null)
    setPopupForm({
      title: "",
      textContent: "",
      imageUrl: "",
      targetLink: "",
      isActive: false,
      imageFile: null,
      imagePreview: "",
      imageError: "",
    })
  }

  const uploadPopupImage = async () => {
    if (!popupForm.imageFile) return popupForm.imageUrl
    const validationError = validateImageFile(popupForm.imageFile)
    if (validationError) {
      setPopupForm((prev) => ({ ...prev, imageError: validationError }))
      return null
    }
    try {
      const formData = new FormData()
      formData.append("image", popupForm.imageFile)
      const response = await storageService.uploadImage(formData)
      return response.data?.image?.path || response.data?.image || ""
    } catch (error) {
      setPopupForm((prev) => ({ ...prev, imageError: getUploadErrorMessage(error) }))
      return null
    }
  }

  const handleSubmitPopup = async (e) => {
    e.preventDefault()
    setPopupStatus("")
    const imageUrl = await uploadPopupImage()
    if (imageUrl === null) return
    try {
      const payload = { ...popupForm, imageUrl }
      delete payload.imageFile
      delete payload.imagePreview
      delete payload.imageError
      if (editingPopup) {
        await adminService.updatePopupAd(editingPopup.id || editingPopup._id, payload)
        setPopupStatus("Popup ad updated")
      } else {
        await adminService.createPopupAd(payload)
        setPopupStatus("Popup ad created")
      }
      resetPopupForm()
      fetchPopupAds()
    } catch (error) {
      setPopupStatus(error.response?.data?.message || "Unable to save popup ad")
    }
  }

  const handleEditPopup = (popup) => {
    setEditingPopup(popup)
    setPopupForm({
      title: popup.title || "",
      textContent: popup.textContent || "",
      imageUrl: popup.imageUrl || "",
      targetLink: popup.targetLink || "",
      isActive: Boolean(popup.isActive),
      imageFile: null,
      imagePreview: "",
      imageError: "",
    })
  }

  const handleDeletePopup = async (popup) => {
    if (!confirm("Delete this popup ad?")) return
    try {
      await adminService.deletePopupAd(popup.id || popup._id)
      setPopupStatus("Popup ad deleted")
      fetchPopupAds()
    } catch (error) {
      setPopupStatus(error.response?.data?.message || "Unable to delete popup ad")
    }
  }

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await orderService.update(id, { status })
      fetchOrders()
      fetchDashboardData()
    } catch (error) {
      console.error("Order status update failed", error)
      alert("Unable to update order status. Please try again.")
    }
  }

  const handleUpdateOrderPaymentStatus = async (id, paymentStatus) => {
    try {
      await orderService.update(id, { paymentStatus })
      fetchOrders()
      fetchDashboardData()
    } catch (error) {
      console.error("Order payment status update failed", error)
      alert("Unable to update order payment status. Please try again.")
    }
  }

  const resetProductForm = () => {
    if (productForm.imagePreview) URL.revokeObjectURL(productForm.imagePreview)
    setProductForm(PRODUCT_FORM_INITIAL)
  }

  const fetchPromos = async () => {
    try {
      setLoading(true)
      setPromoStatus("")
      const response = await adminService.getPromos()
      setPromos(normalizeResponseArray(response.data, ["promos", "data"]))
    } catch (error) {
      setPromos([])
      setPromoStatus(error.response?.status === 404 ? "Promo routes are unavailable." : "Unable to load promo codes.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPopupAds = async () => {
    try {
      setLoading(true)
      setPopupStatus("")
      const response = await adminService.getPopupAds()
      setPopupAds(normalizeResponseArray(response.data, ["popups", "data"]))
    } catch (error) {
      setPopupAds([])
      setPopupStatus(error.response?.status === 404 ? "Popup ad routes are unavailable." : "Unable to load popup ads.")
    } finally {
      setLoading(false)
    }
  }

  const uploadProductImage = async () => {
    if (!productForm.imageFile) return productForm.image

    const validationError = validateImageFile(productForm.imageFile)
    if (validationError) {
      setProductForm((prev) => ({ ...prev, imageError: validationError }))
      return null
    }

    try {
      const formData = new FormData()
      formData.append("image", productForm.imageFile)
      const response = await storageService.uploadImage(formData)

      return response.data?.image?.path || response.data?.image || ""
    } catch (error) {
      setProductForm((prev) => ({ ...prev, imageError: getUploadErrorMessage(error) }))
      return null
    }
  }

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase()
    return products
      .filter((product) => {
        const categoryLabel = getProductCategoryLabel(product, categoryOptions)
        const text = `${product.name || ""} ${categoryLabel || ""} ${product.tag || ""}`.toLowerCase()
        const matchesSearch = !search || text.includes(search)
        const matchesCategory = productCategory === "all" || categoryLabel === productCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        const aValue = a[sortField] ?? ""
        const bValue = b[sortField] ?? ""
        if (sortField === "price" || sortField === "stock") {
          return sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
        }
        return sortOrder === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString())
      })
  }, [products, productSearch, productCategory, sortField, sortOrder, categoryOptions])

  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase()
    return orders.filter((order) => {
      const label = `${order.orderNumber || order.id || order._id || ""} ${order.customerName || order.customer_name || ""} ${order.customerPhone} ${order.status || ""}`.toLowerCase()
      return !search || label.includes(search)
    })
  }, [orders, orderSearch])

  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase()
    return customers.filter((customer) => {
      const phone = customer.phone || customer.phoneno || customer.Phone || ""
      const label = `${customer.full_name || customer.name || ""} ${phone} ${customer.email || ""} ${customer.role || ""}`.toLowerCase()
      return !search || label.includes(search)
    })
  }, [customers, customerSearch])

  const productFilterCategories = useMemo(
    () => ["all", ...new Set(products.map((product) => getProductCategoryLabel(product, categoryOptions)))],
    [products, categoryOptions]
  )

  return (
    <div className="relative flex min-h-screen max-w-full flex-col overflow-x-hidden bg-slate-50 lg:flex-row">
      <Motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed inset-x-0 top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:hidden"
      >
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.3em]">Admin panel</p>
          <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">HaatOnline</h1>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
          <Menu size={20} />
        </button>
      </Motion.div>

      <aside className="hidden h-screen w-full max-w-xs shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col lg:sticky lg:top-0">
        <div className="flex h-full flex-col p-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">HaatOnline</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Admin</h2>
            <p className="mt-2 text-sm text-slate-500">Grocery operations dashboard</p>
          </div>

          <nav className="space-y-2 text-sm font-medium text-slate-700">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${activeTab === item.id ? "bg-emerald-50 text-emerald-700 shadow-sm" : "hover:bg-slate-100"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Admin account</p>
            <p className="mt-2 text-slate-500">Manage products, orders, and customers from this panel.</p>
            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <Motion.aside
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-xl sm:p-6 lg:hidden"
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">HaatOnline</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Admin</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200">
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2 text-sm font-medium text-slate-700">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${activeTab === item.id ? "bg-emerald-50 text-emerald-700 shadow-sm" : "hover:bg-slate-100"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </Motion.aside>

      <main className="min-w-0 flex-1 max-w-full overflow-x-hidden px-3 py-24 sm:px-6 lg:px-8 xl:px-10">
        {activeTab === "dashboard" && (
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 max-w-full">
            <div className="mb-8 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-sm sm:tracking-[0.3em]">Performance</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Overview</h1>
                <p className="mt-2 max-w-2xl text-slate-600">Review revenue, order activity, and inventory health in one place.</p>
              </div>
              <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                <Button variant="secondary" size="md" onClick={() => setActiveTab("products")}>Manage products</Button>
                <Button variant="primary" size="md" onClick={() => setActiveTab("orders")}>View orders</Button>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
              <StatCard label="Revenue" value={formatCurrency(stats.totalSales)} icon={<Sparkles size={24} />} subtext="Total sales to date" />
              <StatCard label="Orders" value={stats.orderCount} icon={<ShoppingCart size={24} />} subtext="Orders placed" />
              <StatCard label="Products" value={stats.productCount} icon={<Package size={24} />} subtext="Available inventory" />
              <StatCard label="Customers" value={stats.customerCount} icon={<Users size={24} />} subtext="Registered shoppers" />
            </div>

            <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
              <AnalyticsCharts chartData={chartData} />
              <div className="min-w-0 space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Quick insights</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Latest activity</h2>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Recent orders</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{recentOrders.length}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Top status</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{getStatusLabel(recentOrders[0]?.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-slate-900">Recent orders</h2>
                  <p className="text-sm text-slate-500">A quick snapshot of the latest five orders.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("orders")}>View all orders</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[720px] text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.15em] text-xs">
                    <tr>
                      <th className="py-4 px-4">Order</th>
                      <th className="py-4 px-4">Customer</th>
                      <th className="py-4 px-4">Amount</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 5).map((order, idx) => (
                      <tr key={order._id} className={`border-b border-slate-100 transition-all hover:bg-emerald-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                        <td className="py-4 px-4 font-semibold text-slate-900">{order.orderNumber || order._id?.slice(-8)}</td>
                        <td className="py-4 px-4 text-slate-700">{order.customerName || order.customer_name || "Guest"}</td>
                        <td className="py-4 px-4 font-bold text-emerald-600">{formatCurrency(order.totalAmount ?? order.total_amount ?? 0)}</td>
                        <td className="py-4 px-4"><Badge label={getStatusLabel(order.status)} variant={order.status} /></td>
                        <td className="py-4 px-4 text-slate-500 text-xs">{formatDate(order.createdAt ?? order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Motion.div>
        )}

        {activeTab === "products" && (
          <ProductsView
            products={filteredProducts}
            loading={loading}
            onAdd={() => {
              resetProductForm()
              setEditingProduct(null)
              setShowAddProductModal(true)
            }}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            searchTerm={productSearch}
            onSearch={setProductSearch}
            category={productCategory}
            onCategoryChange={setProductCategory}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={setSortField}
            onSortOrderChange={setSortOrder}
            categories={productFilterCategories}
            categoryOptions={categoryOptions}
          />
        )}

        {activeTab === "orders" && (
          <OrdersView
            orders={filteredOrders}
            loading={loading}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdateOrderPaymentStatus}
            searchTerm={orderSearch}
            onSearch={setOrderSearch}
            parseLocationString={parseLocationString}
            planRouteFromShop={(ordersList) => {
              // expose to OrdersView via prop
              // returns reordered array
              return ordersList;
            }}
          />
        )}

        {activeTab === "customers" && (
          <CustomersView customers={filteredCustomers} loading={loading} searchTerm={customerSearch} onSearch={setCustomerSearch} />
        )}

        {activeTab === "promos" && (
          <PromoCodesView
            promos={promos}
            form={promoForm}
            setForm={setPromoForm}
            editing={editingPromo}
            status={promoStatus}
            loading={loading}
            onSubmit={handleSubmitPromo}
            onCancel={resetPromoForm}
            onEdit={handleEditPromo}
            onDelete={handleDeletePromo}
          />
        )}

        {activeTab === "popups" && (
          <PopupAdsView
            popups={popupAds}
            form={popupForm}
            setForm={setPopupForm}
            editing={editingPopup}
            status={popupStatus}
            loading={loading}
            onSubmit={handleSubmitPopup}
            onCancel={resetPopupForm}
            onEdit={handleEditPopup}
            onDelete={handleDeletePopup}
          />
        )}

        {activeTab === "settings" && (
          <div className="max-w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Settings</h2>
            <p className="mt-3 text-slate-600">Admin settings are under construction. Use the sidebar to review all management sections.</p>
          </div>
        )}

        {showAddProductModal && (
          <ProductModal
            form={productForm}
            setForm={setProductForm}
            editing={editingProduct}
            categories={categoryOptions}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            onRetryCategories={fetchCategories}
            onClose={() => {
              setShowAddProductModal(false)
              resetProductForm()
              setEditingProduct(null)
            }}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          />
        )}
      </main>
    </div>
  )
}

function createTrendData(analyticsTrend, recentOrders) {
  if (Array.isArray(analyticsTrend) && analyticsTrend.length > 0) {
    return analyticsTrend
  }

  if (!Array.isArray(recentOrders) || recentOrders.length === 0) {
    return []
  }

  const aggregated = recentOrders.reduce((acc, order) => {
    const createdAt = new Date(order.createdAt ?? order.created_at)
    if (!createdAt || Number.isNaN(createdAt.getTime())) return acc
    const dateKey = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(createdAt)
    const amount = Number(order.totalAmount ?? order.total_amount ?? 0)
    const existing = acc.find((item) => item.date === dateKey)
    if (existing) {
      existing.revenue += amount
      existing.orders += 1
    } else {
      acc.push({ date: dateKey, revenue: amount, orders: 1 })
    }
    return acc
  }, [])

  return aggregated.sort((a, b) => new Date(a.date) - new Date(b.date))
}

function ProductsView({
  products,
  loading,
  onAdd,
  onEdit,
  onDelete,
  searchTerm,
  onSearch,
  category,
  onCategoryChange,
  sortField,
  sortOrder,
  onSort,
  onSortOrderChange,
  categories,
  categoryOptions,
}) {
  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 max-w-full">
      <div className="mb-8 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Product catalog</h1>
          <p className="mt-1 text-slate-500">Search, sort, and manage your grocery inventory.</p>
        </div>
        <Button variant="primary" size="md" onClick={onAdd} className="w-full sm:w-auto">
          <Plus size={18} /> Add product
        </Button>
      </div>

      <div className="mb-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
        <Input
          label="Search products"
          id="product-search"
          type="search"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name, category, or tag"
        />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {categories.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Sort by
            <div className="mt-2 flex min-w-0 gap-2">
              <select
                value={sortField}
                onChange={(e) => onSort(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
              <button
                type="button"
                onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                className="inline-flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                aria-label="Toggle sort order"
              >
                {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
            </div>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm sm:p-10">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm sm:p-12">
          <p className="text-lg font-semibold text-slate-900">No products available</p>
          <p className="mt-2 text-slate-500">Create your first product or refresh the inventory list.</p>
        </div>
      ) : (
        <div className="max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[780px] text-left text-sm text-slate-600">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 text-slate-700 uppercase tracking-[0.12em] text-xs font-semibold border-b-2 border-emerald-200">
                <tr>
                  <th className="py-4 px-4">Product</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr key={product._id} className={`border-b border-slate-100 transition-all hover:bg-emerald-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="py-4 px-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-slate-100">
                          <img src={resolveAssetUrl(product.image || product.imageUrl) || "https://via.placeholder.com/96"} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[240px]">{product.tag || "No tag"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{getProductCategoryLabel(product, categoryOptions)}</td>
                    <td className="py-4 px-4 font-semibold text-slate-900">{formatCurrency(product.price)}</td>
                    <td className="py-4 px-4 text-slate-600">{product.stock ?? 0}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => onEdit(product)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition-all hover:bg-blue-200 hover:shadow-md active:scale-95">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => onDelete(product._id)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700 transition-all hover:bg-red-200 hover:shadow-md active:scale-95">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Motion.div>
  )
}

function OrdersView({
  orders,
  loading,
  onUpdateStatus,
  onUpdatePaymentStatus,
  searchTerm,
  onSearch,
  parseLocationString,
}) {
  // Bill preview modal state
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const SHOP_LAT = Number(
    import.meta.env.VITE_SHOP_LAT || 27.429280726769314
  );

  const SHOP_LNG = Number(
    import.meta.env.VITE_SHOP_LNG || 85.03281182486674
  );

  const haversine = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some((v) => v === undefined || v === null)) return Infinity;
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const planRoute = () => {
    // nearest neighbor starting from shop
    const pending = orders.filter((o) => ((o.status || o.order_status || "pending").toString().toLowerCase()) === "pending");
    const others = orders.filter((o) => ((o.status || o.order_status || "pending").toString().toLowerCase()) !== "pending");
    const coords = pending.map((o) => ({ order: o, loc: parseLocationString(o.deliveryAddress) }));
    const remaining = coords.filter(
      (c) =>
        c.loc &&
        typeof c.loc.lat === "number" &&
        !Number.isNaN(c.loc.lat) &&
        typeof c.loc.lng === "number" &&
        !Number.isNaN(c.loc.lng)
    );
    const route = [];
    let curLat = SHOP_LAT;
    let curLng = SHOP_LNG;
    while (remaining.length) {
      let bestIdx = 0;
      let bestDist = haversine(curLat, curLng, remaining[0].loc.lat, remaining[0].loc.lng);
      for (let i = 1; i < remaining.length; i++) {
        const d = haversine(curLat, curLng, remaining[i].loc.lat, remaining[i].loc.lng);
        if (d < bestDist) {
          bestDist = d; bestIdx = i;
        }
      }
      const picked = remaining.splice(bestIdx, 1)[0];
      route.push(picked.order);
      curLat = picked.loc.lat; curLng = picked.loc.lng;
    }
    return [...route, ...others];
  };

  return (
    <>
      {/* Bill Preview Modal */}
      {showBillPreview && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <button
              className="absolute top-2 right-2 text-xl text-slate-500 hover:text-slate-900"
              onClick={() => setShowBillPreview(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <BillPreview
              cartItems={selectedBill.items ?? []}
              subtotal={selectedBill.subtotal ?? 0}
              deliveryFee={selectedBill.deliveryFee ?? 0}
              codFee={selectedBill.codFee ?? 0}
              promoDiscount={selectedBill.promoDiscount ?? 0}
              totalAmount={selectedBill.totalAmount ?? 0}
              customerName={selectedBill.customerName ?? selectedBill.customer_name ?? "—"}
              customerPhone={selectedBill.customerPhone ?? selectedBill.phone_number ?? "—"}
              deliveryAddress={selectedBill.deliveryAddress ?? "—"}
              landmark={selectedBill.landmark ?? ""}
              deliveryType={selectedBill.deliveryType ?? selectedBill.delivery_type ?? ""}
              paymentMode={selectedBill.paymentMode ?? selectedBill.payment_mode ?? ""}
              promoCode={selectedBill.promoCode ?? ""}
              createdAt={selectedBill.createdAt ?? selectedBill.created_at}
            />
          </div>
        </div>
      )}
      <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 max-w-full">
        <div className="mb-8 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Orders</h1>
            <p className="mt-1 text-slate-500">Review order details and update fulfillment status.</p>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-3 xl:w-auto xl:flex-row xl:items-center">
            <Input
              label="Search orders"
              id="order-search"
              type="search"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search order ID, customer, phone no or status"
            />
            <button
              type="button"
              onClick={() => {
                const planned = planRoute();
                const ev = new CustomEvent("admin:routePlanned", { detail: planned });
                window.dispatchEvent(ev);
              }}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto sm:min-w-[180px] sm:whitespace-nowrap"
            >
              Plan Delivery Route
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm sm:p-10">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm sm:p-12">
            <p className="text-lg font-semibold text-slate-900">No orders yet</p>
            <p className="mt-2 text-slate-500">Orders will populate here as customers check out.</p>
          </div>
        ) : (
          <div className="max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="min-w-[1040px] table-fixed text-left text-xs text-slate-600">
                <thead className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 text-[10px] uppercase tracking-[0.12em] text-slate-700 border-b-2 border-emerald-200 font-bold">
                  <tr>
                    <th className="px-3 py-3">Order</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Order Status</th>
                    <th className="px-3 py-3">Payment Status</th>
                    <th className="px-3 py-3">Placed</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Update Status</th>
                    <th className="px-3 py-3">Update Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const loc = order.location || parseLocationString(order.deliveryAddress || order.deliveryAddress_raw || "") || {};
                    const latitude = Number(loc?.lat ?? loc?.latitude ?? (Array.isArray(loc?.coordinates) ? loc.coordinates[1] : undefined));
                    const longitude = Number(loc?.lng ?? loc?.longitude ?? (Array.isArray(loc?.coordinates) ? loc.coordinates[0] : undefined));
                    const hasValidCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
                    const shortAddress = loc.address?.split(",").slice(0, 2).join(", ") || "No address";
                    let mapsHref = "";
                    if (hasValidCoordinates) {
                      mapsHref = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                    }
                    return (
                      <tr key={order.id || order._id} className={`border-b border-slate-100 transition-all hover:bg-emerald-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                        <td className="px-3 py-3 max-w-[120px] truncate whitespace-nowrap">
                          <div className="font-semibold text-slate-900 truncate max-w-[120px]">
                            #{order.orderNumber || (order.id || order._id)?.slice(-8)}
                          </div>
                        </td>
                        <td className="px-3 py-3 max-w-[120px] truncate">
                          <div className="flex flex-col">
                            <span className="max-w-[120px] truncate font-medium text-slate-900">{order.customerName || order.customer_name || "Guest"}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-600">{order.customerPhone || order.phone_number || "—"}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-semibold text-emerald-600">{formatCurrency(order.totalAmount ?? order.total_amount ?? 0)}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Badge label={getStatusLabel(order.status)} variant={order.status} className="px-2 py-0.5 text-[11px]" />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <Badge label={getPaymentLabel(order.paymentStatus || order.payment || "pending")} variant={order.paymentStatus || order.payment || "pending"} className="px-2 py-0.5 text-[11px]" />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-500 text-xs">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            title={formatDate(order.createdAt ?? order.created_at)}
                            onClick={() => {
                              setSelectedBill(order);
                              setShowBillPreview(true);
                            }}
                          >
                            🧾 Bill Preview
                          </button>
                          <div className="mt-1 text-[10px] text-slate-400">{formatDate(order.createdAt ?? order.created_at)}</div>
                        </td>
                        <td className="px-3 py-3 max-w-[180px]">
                          {hasValidCoordinates ? (
                            <div className="space-y-1 text-xs leading-tight">
                              <p className="font-medium text-slate-800 truncate">{shortAddress}</p>
                              <p className="text-[11px] text-slate-400">
                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                              </p>
                              {loc.landmark && (
                                <p className="truncate text-slate-500">
                                  {loc.landmark}
                                </p>
                              )}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex text-emerald-600 hover:underline font-semibold"
                                title={`Open exact location in Google Maps (${latitude}, ${longitude})`}
                              >
                                📍 Open in Maps
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No location
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-3 min-w-[140px]">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                            className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-emerald-400 focus:border-emerald-500 focus:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer shadow-sm hover:shadow-md"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-3 py-3 min-w-[140px]">
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => onUpdatePaymentStatus(order._id, e.target.value)}
                            className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-emerald-400 focus:border-emerald-500 focus:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer shadow-sm hover:shadow-md"
                          >
                            {orderPaymentOptions.map((payment) => (
                              <option key={payment} value={payment}>
                                {getPaymentLabel(payment)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Motion.div>
    </>
  )
}

function CustomersView({ customers, loading, searchTerm, onSearch }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 max-w-full">
      <div className="mb-8 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Customers</h1>
          <p className="mt-1 text-slate-500">Browse customer profiles and account activity.</p>
        </div>
        <div className="w-full max-w-xl">
          <Input
            label="Search customers"
            id="customer-search"
            type="search"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name, email, or role"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm sm:p-10">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm sm:p-12">
          <p className="text-lg font-semibold text-slate-900">No customers available</p>
          <p className="mt-2 text-slate-500">Customers will appear once they sign up or place an order.</p>
        </div>
      ) : (
        <div className="max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] text-left text-sm text-slate-600">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 text-slate-700 uppercase tracking-[0.15em] text-xs font-bold border-b-2 border-emerald-200">
                <tr>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Phone</th>
                  <th className="py-4 px-4">Total Spent</th>
                  <th className="py-4 px-4">Recent Order</th>
                  <th className="py-4 px-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, idx) => {
                  const phone = customer.phone || customer.phoneno || "-"
                  const recentOrder = customer.recentOrder
                  return (
                    <tr key={customer.id || customer._id} className={`border-b border-slate-100 transition-all hover:bg-emerald-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="py-4 px-4 font-medium text-slate-900"><span className="block max-w-[180px] truncate">{customer.full_name || customer.name || "Customer"}</span></td>
                      <td className="py-4 px-4"><span className="block max-w-[220px] truncate">{customer.email || "-"}</span></td>
                      <td className="py-4 px-4 whitespace-nowrap">{phone}</td>
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-emerald-600">{formatCurrency(customer.totalSpent ?? 0)}</td>
                      <td className="py-4 px-4">
                        {recentOrder ? (
                          <span className="block max-w-[220px] truncate">
                            {recentOrder.orderNumber || "Order"} · {formatCurrency(recentOrder.totalAmount ?? 0)}
                          </span>
                        ) : (
                          <span className="text-slate-400">No orders yet</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-500">{formatDate(customer.created_at || customer.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Motion.div>
  )
}

function PromoCodesView({ promos, form, setForm, editing, status, loading, onSubmit, onCancel, onEdit, onDelete }) {
  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 max-w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Promo Codes</h1>
        <p className="mt-1 text-slate-500">Create and manage customer discounts.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit promo" : "Add promo"}</h2>
          <div className="mt-5 grid gap-4">
            <Input label="Code" id="promo-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" />
            <label className="block text-sm font-medium text-slate-700">
              Discount type
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:outline-none">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <div className="flex flex-col gap-2">
              <label htmlFor="promo-delivery-options" className="text-sm font-medium text-slate-700">
                Delivery Options
              </label>
              <select
                id="promo-delivery-options"
                value={
                  form.deliveryOptions &&
                    form.deliveryOptions.includes("instant") &&
                    form.deliveryOptions.includes("scheduled")
                    ? "both"
                    : form.deliveryOptions?.[0] || "both"
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    deliveryOptions: val === "both" ? ["instant", "scheduled"] : [val],
                  });
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-green-500 focus:outline-none"
              >
                <option value="both">Both (Instant & Scheduled)</option>
                <option value="instant">Instant Only</option>
                <option value="scheduled">Scheduled Only</option>
              </select>
            </div>
            <Input label="Discount value" id="promo-discount" type="number" min="0" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            <Input label="Minimum order value" id="promo-minimum" type="number" min="0" step="0.01" value={form.minimumOrderValue} onChange={(e) => setForm({ ...form, minimumOrderValue: e.target.value })} />
            <Input label="Expiry date" id="promo-expiry" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.activeStatus} onChange={(e) => setForm({ ...form, activeStatus: e.target.checked })} className="h-4 w-4" />
              Active
            </label>
          </div>
          {status && <p className="mt-4 text-sm font-medium text-emerald-700">{status}</p>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">{editing ? "Update promo" : "Create promo"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>}
          </div>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-slate-500">Loading promo codes...</div>
          ) : promos.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No promo codes yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.15em] text-slate-500">
                  <tr>
                    <th className="px-4 py-4">Code</th>
                    <th className="px-4 py-4">Discount</th>
                    <th className="px-4 py-4">Minimum</th>
                    <th className="px-4 py-4">Expiry</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo.id || promo._id} className="border-t border-slate-100">
                      <td className="px-4 py-4 font-semibold text-slate-900">{promo.code}</td>
                      <td className="px-4 py-4">{promo.discountType === "percentage" ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}</td>
                      <td className="px-4 py-4">{formatCurrency(promo.minimumOrderValue ?? promo.minOrderAmount ?? 0)}</td>
                      <td className="px-4 py-4">{promo.expiryDate ? formatDate(promo.expiryDate) : "No expiry"}</td>
                      <td className="px-4 py-4">{promo.activeStatus ? "Active" : "Inactive"}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => onEdit(promo)}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => onDelete(promo)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Motion.div>
  )
}

function PopupAdsView({ popups, form, setForm, editing, status, loading, onSubmit, onCancel, onEdit, onDelete }) {
  const previewSrc = form.imagePreview || resolveAssetUrl(form.imageUrl)
  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview)
    if (!file) {
      setForm({ ...form, imageFile: null, imagePreview: "", imageError: "" })
      return
    }
    const imageError = validateImageFile(file)
    setForm({
      ...form,
      imageFile: imageError ? null : file,
      imagePreview: imageError ? "" : URL.createObjectURL(file),
      imageError,
    })
  }

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 max-w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Popup Ads</h1>
        <p className="mt-1 text-slate-500">Manage the lightweight marketing popup shown to shoppers.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={onSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit popup" : "Add popup"}</h2>
          <div className="mt-5 grid gap-4">
            <Input label="Title" id="popup-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <label className="block text-sm font-medium text-slate-700">
              Text content
              <textarea value={form.textContent} onChange={(e) => setForm({ ...form, textContent: e.target.value })} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
            </label>
            <Input label="Image URL" id="popup-image-url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            <label className="block text-sm font-medium text-slate-700">
              Popup image
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              {form.imageError && <p className="mt-2 text-sm text-rose-600">{form.imageError}</p>}
            </label>
            <Input label="Target link" id="popup-link" value={form.targetLink} onChange={(e) => setForm({ ...form, targetLink: e.target.value })} placeholder="https://example.com" />
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
              Show popup
            </label>
          </div>
          {previewSrc && <img src={previewSrc} alt="Popup preview" className="mt-5 max-h-56 w-full rounded-2xl object-cover" />}
          {status && <p className="mt-4 text-sm font-medium text-emerald-700">{status}</p>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">{editing ? "Update popup" : "Create popup"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>}
          </div>
        </form>

        <div className="grid content-start gap-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading popup ads...</div>
          ) : popups.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">No popup ads yet</div>
          ) : (
            popups.map((popup) => (
              <div key={popup.id || popup._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {popup.imageUrl && <img src={resolveAssetUrl(popup.imageUrl)} alt={popup.title || "Popup"} className="h-28 w-full rounded-2xl object-cover sm:w-40" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{popup.title || "Untitled popup"}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${popup.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{popup.isActive ? "On" : "Off"}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{popup.textContent || "Image only popup"}</p>
                    {popup.targetLink && <p className="mt-2 truncate text-xs text-slate-400">{popup.targetLink}</p>}
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(popup)}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(popup)}>Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Motion.div>
  )
}

function ProductModal({
  form,
  setForm,
  onSubmit,
  onClose,
  editing,
  categories,
  categoriesLoading,
  categoriesError,
  onRetryCategories,
}) {
  const isFormValid = Boolean(form.name && form.category && form.price && form.stock && form.unit && !form.imageError)
  const previewSrc = form.imagePreview || resolveAssetUrl(form.image)

  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (form.imagePreview) URL.revokeObjectURL(form.imagePreview)

    if (!file) {
      setForm({ ...form, imageFile: null, imagePreview: "", imageError: "" })
      return
    }

    const imageError = validateImageFile(file)
    setForm({
      ...form,
      imageFile: imageError ? null : file,
      imagePreview: imageError ? "" : URL.createObjectURL(file),
      imageError,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 py-6 backdrop-blur-sm sm:items-center sm:p-4">
      <Motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:rounded-[32px] sm:p-8">
        <div className="mb-8 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{editing ? "Edit product" : "Add product"}</h2>
            <p className="mt-2 text-slate-500">Keep your inventory updated with accurate stock and pricing.</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </div>

        <form onSubmit={onSubmit} className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">
          <Input label="Product name" id="product-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fresh apples" />
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              id="product-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              disabled={categoriesLoading || categories.length === 0}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="">{categoriesLoading ? "Loading categories..." : "Select Category"}</option>
              {categories.map((category) => (
                <option key={getCategoryId(category)} value={getCategoryId(category)}>
                  {getCategoryDisplayLabel(getCategoryName(category))}
                </option>
              ))}
            </select>
            {categoriesError && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-rose-600">
                <span>{categoriesError}</span>
                <button
                  type="button"
                  onClick={onRetryCategories}
                  className="font-semibold text-rose-700 underline hover:text-rose-800"
                >
                  Retry
                </button>
              </div>
            )}
          </label>
          <Input label="Price" id="product-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="499" />
          <Input label="Stock" id="product-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="12" />
          <Input label="Unit" id="product-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Kg" />
          <Input label="Tag" id="product-tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Organic" />
          <div className="lg:col-span-2">
            <Input label="Image URL" id="product-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/image.jpg" />
          </div>
          <label className="lg:col-span-2 block text-sm font-medium text-slate-700">
            Product image
            <input
              id="product-image-file"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="mt-2 w-full max-w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            {form.imageError && <p className="mt-2 text-sm text-rose-600">{form.imageError}</p>}
          </label>
          {previewSrc && (
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Image preview</p>
              <img src={previewSrc} alt="Product preview" className="h-40 w-full rounded-3xl object-cover sm:h-56" />
            </div>
          )}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" type="button" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={!isFormValid} className="w-full sm:w-auto">{editing ? "Update product" : "Add product"}</Button>
          </div>
        </form>
      </Motion.div>
    </div>
  )
}

