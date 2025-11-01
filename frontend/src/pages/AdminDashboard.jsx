import { useEffect, useState } from "react"
import axios from "axios"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard")
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    productCount: 0,
    customerCount: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Form state for adding/editing products
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (active === "products") {
      fetchProducts()
    } else if (active === "orders") {
      fetchOrders()
    } else if (active === "customers") {
      fetchCustomers()
    } else if (active === "dashboard") {
      fetchDashboardData()
    }
  }, [active])

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats")
      const ordersRes = await axios.get(
        "http://localhost:5000/api/admin/recent-orders"
      )
      setStats(statsRes.data)
      setRecentOrders(ordersRes.data)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/products")
      setProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/orders")
      setOrders(response.data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        "http://localhost:5000/api/admin/customers"
      )
      setCustomers(response.data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        image: productForm.image,
      }

      await axios.post("http://localhost:5000/api/products", productData)
      setShowAddProductModal(false)
      resetProductForm()
      fetchProducts()
      fetchDashboardData() // Update stats
      alert("Product added successfully!")
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product. Please try again.")
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        image: productForm.image,
      }

      await axios.put(
        `http://localhost:5000/api/products/${editingProduct.id}`,
        productData
      )
      setShowAddProductModal(false)
      setEditingProduct(null)
      resetProductForm()
      fetchProducts()
      alert("Product updated successfully!")
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update product. Please try again.")
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`)
      fetchProducts()
      fetchDashboardData() // Update stats
      alert("Product deleted successfully!")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product. Please try again.")
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.imageUrl || "",
    })
    setShowAddProductModal(true)
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        status: newStatus,
      })
      fetchOrders()
      if (active === "dashboard") {
        fetchDashboardData()
      }
      alert("Order status updated successfully!")
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status. Please try again.")
    }
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      image: "",
    })
    setEditingProduct(null)
  }

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { id: "products", label: "Products", icon: <Package size={20} /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { id: "customers", label: "Customers", icon: <Users size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-green-600">
          Grocery Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg text-left transition ${
                active === item.id ? "bg-green-600" : "hover:bg-green-600/60"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <button className="flex items-center gap-3 px-4 py-3 m-4 bg-green-800 rounded-lg hover:bg-green-900 transition">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {active === "dashboard" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-green-700">
                Admin Dashboard
              </h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                label="Total Sales"
                value={`$${stats.totalSales.toFixed(2)}`}
              />
              <StatCard label="Orders" value={stats.orderCount} />
              <StatCard label="Products" value={stats.productCount} />
              <StatCard label="Customers" value={stats.customerCount} />
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-green-700 mb-4">
                Recent Orders
              </h2>
              {recentOrders.length === 0 ? (
                <p className="text-gray-500">No orders yet</p>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-green-100 text-left text-green-700">
                      <th className="py-2 px-4">Order ID</th>
                      <th className="py-2 px-4">Customer</th>
                      <th className="py-2 px-4">Amount</th>
                      <th className="py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-2 px-4">
                          {order._id?.slice(-8) || "N/A"}
                        </td>
                        <td className="py-2 px-4">
                          {order.userId?.name || "Guest"}
                        </td>
                        <td className="py-2 px-4">
                          ${order.totalAmount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {active === "products" && (
          <ProductsView
            products={products}
            loading={loading}
            onAdd={() => {
              resetProductForm()
              setShowAddProductModal(true)
            }}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {active === "orders" && (
          <OrdersView
            orders={orders}
            loading={loading}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {active === "customers" && (
          <CustomersView customers={customers} loading={loading} />
        )}

        {active === "settings" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-green-700 mb-4">Settings</h2>
            <p className="text-gray-500">Settings panel coming soon...</p>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddProductModal && (
          <ProductModal
            form={productForm}
            setForm={setProductForm}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onClose={() => {
              setShowAddProductModal(false)
              resetProductForm()
            }}
            editing={editingProduct}
          />
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <h3 className="text-gray-500">{label}</h3>
      <p className="text-2xl font-bold text-green-700">{value}</p>
    </div>
  )
}

function ProductsView({ products, loading, onAdd, onEdit, onDelete }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Products</h1>
        <button
          onClick={onAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-100 text-left text-green-700">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {product.category}
                  </td>
                  <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">{product.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function OrdersView({ orders, loading, onUpdateStatus }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Orders</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-100 text-left text-green-700">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-mono text-sm">
                    {order._id?.slice(-8)}
                  </td>
                  <td className="py-3 px-4">
                    {order.userId?.name || "Guest"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {order.userId?.email}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {order.items?.length || 0} item(s)
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        onUpdateStatus(order._id, e.target.value)
                      }
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function CustomersView({ customers, loading }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-700">Customers</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-green-100 text-left text-green-700">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Member Since</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {customer.role || "customer"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function ProductModal({ form, setForm, onSubmit, onClose, editing }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-full overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          {editing ? "Edit Product" : "Add New Product"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Fresh Tomatoes"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Category</label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Vegetables"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., kg, ltr, pcs"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              required
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Fresh, Packaged, Frozen, Organic"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex gap-3 pt-4 flex-col sm:flex-row">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              {editing ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
