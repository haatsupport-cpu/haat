import { useEffect, useState } from "react"
import { motion as Motion } from "framer-motion"
import {
  User,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react"

import { useAuth } from "../context/useAuth"
import { authService } from "../services/auth-service"
import { checkoutService } from "../services/checkout-service"
import { orderService } from "../services/order-service"
import { resolveAssetUrl } from "../services/api"
import { storageService } from "../services/storage-service"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const validateImageFile = (file) => {
  if (!file) return ""
  if (!file.type?.startsWith("image/")) return "Please select a valid image file."
  if (file.size > MAX_IMAGE_SIZE) return "Image size must not exceed 5MB."
  return ""
}

const getUploadErrorMessage = (error) =>
  error?.response?.data?.message ||
  (error?.code === "ECONNABORTED" ? "Upload timed out. Please try again." : "Failed to update profile")

export default function Profile() {
  const { logout } = useAuth()

  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneno: "",
    photo: "",
    currentPassword: "",
    newPassword: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [imageError, setImageError] = useState("")

  const [orders, setOrders] = useState([])
  const [promos, setPromos] = useState([])
  const [promoMessage, setPromoMessage] = useState("")

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)

        // =========================
        // FETCH USER
        // =========================

        const userRes = await authService.getCurrentUser()

        console.log("USER DATA:", userRes.data)

        const userData =
          userRes.data.user ||
          userRes.data.data ||
          userRes.data

        setFormData((prev) => ({
          ...prev,
          name: userData?.name || "",
          email: userData?.email || "",
          phoneno: userData?.phoneno || "",
          photo: userData?.photo || "",
        }))

        // =========================
        // FETCH ORDERS
        // =========================

        try {
          const orderRes = await orderService.list()

          console.log("ORDERS:", orderRes.data)

          const allOrders =
            orderRes.data.orders ||
            orderRes.data.data ||
            orderRes.data ||
            []

          const filteredOrders = allOrders.filter(
            (order) =>
              order.userId === userData._id ||
              order.userId?._id === userData._id
          )

          setOrders(filteredOrders)
        } catch (err) {
          console.error(
            "Failed to fetch orders",
            err
          )
        }

        try {
          const promoRes = await checkoutService.getMyPromos()
          setPromos(promoRes.data?.promos || [])
        } catch {
          setPromos([])
        }
      } catch (error) {
        console.error(
          "Failed to fetch profile",
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    try {
      let photoUrl = formData.photo

      if (imageFile) {
        const validationError = validateImageFile(imageFile)
        if (validationError) {
          setImageError(validationError)
          return
        }

        const imageData = new FormData()
        imageData.append("image", imageFile)
        const uploadRes = await storageService.uploadImage(imageData)
        photoUrl = uploadRes.data?.image?.path || uploadRes.data?.image || photoUrl
      }

      await authService.updateCurrentUser({
        name: formData.name,
        email: formData.email,
        phoneno: formData.phoneno,
        photo_url: photoUrl,
      })

      setFormData((prev) => ({ ...prev, photo: photoUrl }))
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImageFile(null)
      setImagePreview("")
      setImageError("")

      alert("Profile updated successfully")
    } catch (error) {
      console.error(error)
      alert(getUploadErrorMessage(error))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (imagePreview) URL.revokeObjectURL(imagePreview)

    if (!file) {
      setImageFile(null)
      setImagePreview("")
      setImageError("")
      return
    }

    const validationError = validateImageFile(file)
    setImageFile(validationError ? null : file)
    setImagePreview(validationError ? "" : URL.createObjectURL(file))
    setImageError(validationError)
  }

  const handlePasswordChange = async () => {
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      alert("Password updated successfully")

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }))
    } catch (error) {
      console.error(error)
      alert("Failed to update password")
    }
  }

  const handleCopyPromo = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setPromoMessage(`${code} copied`)
    } catch {
      setPromoMessage("Unable to copy code")
    }
  }

  const handleApplyPromo = (code) => {
    localStorage.setItem("checkoutPromoCode", code)
    setPromoMessage(`${code} ready for checkout`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2ab600] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-5 py-10 text-gray-800 md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 md:text-5xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account information
          </p>
        </div>

        {/* PROFILE CARD */}
        <Motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col items-center gap-5 md:flex-row">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#2ab600]/10 text-[#2ab600]">
              {imagePreview || formData.photo ? (
                <img src={imagePreview || resolveAssetUrl(formData.photo)} alt={formData.name || "Profile"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12" />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {formData.name}
              </h2>

              <p className="mt-1 text-gray-500">
                {formData.phoneno}

              </p>
              <p className="mt-1 text-gray-500">
                {formData.email}
              </p>


              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-xl bg-[#2ab600]/10 px-4 py-2 text-sm font-medium text-[#2ab600]">
                  Active Account
                </div>

                <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                  {orders.length} Orders
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* PERSONAL + PASSWORD */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* PERSONAL */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">
              Personal Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#2ab600]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#2ab600]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Phone
                </label>

                <input
                  type="text"
                  name="phoneno"
                  value={formData.phoneno}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#2ab600]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Profile Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#2ab600]"
                />
                {imageError && <p className="mt-2 text-sm text-red-500">{imageError}</p>}
              </div>

              <button
                onClick={handleSave}
                className="w-full rounded-2xl bg-[#2ab600] px-5 py-3 font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* PASSWORD */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">
              Change Password
            </h2>

            <div className="space-y-5">
              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  placeholder="Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 outline-none focus:border-[#2ab600]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-3.5"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <input
                type={
                  showPassword ? "text" : "password"
                }
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-[#2ab600]"
              />

              <button
                onClick={handlePasswordChange}
                className="w-full rounded-2xl border border-[#2ab600] bg-[#2ab600]/10 px-5 py-3 font-semibold text-[#2ab600]"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* ORDERS */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">My Promos</h2>
              <p className="text-sm text-gray-500">Available offers for your next order</p>
            </div>
            {promoMessage && <p className="text-sm font-medium text-[#2ab600]">{promoMessage}</p>}
          </div>

          {promos.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No promos available
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {promos.map((promo) => {
                const disabled = promo.status !== "Active"
                return (
                  <div
                    key={promo.id || promo.code}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                          Promo Code
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-gray-900">
                          {promo.code}
                        </h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${promo.status === "Active"
                          ? "bg-[#2ab600]/10 text-[#2ab600]"
                          : promo.status === "Used"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                        {promo.status}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <p>{promo.discountText}</p>
                      <p>Minimum order: Rs. {promo.minOrderAmount || 0}</p>
                      <p>
                        Expires: {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : "No expiry"}
                      </p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleCopyPromo(promo.code)}
                        className="rounded-2xl border border-[#2ab600] px-4 py-2 text-sm font-semibold text-[#2ab600] disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                      >
                        Copy Code
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleApplyPromo(promo.code)}
                        className="rounded-2xl bg-[#2ab600] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ORDERS */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">
            My Orders
          </h2>

          {orders.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                    <th className="pb-4">
                      Order Number
                    </th>
                    <th className="pb-4">
                      Date
                    </th>
                    <th className="pb-4">
                      Status
                    </th>
                    <th className="pb-4">
                      Payment
                    </th>
                    <th className="pb-4">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 font-medium">
                        {order.orderNumber}
                      </td>

                      <td className="py-4 text-gray-500">
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="py-4">
                        <span className="rounded-full bg-[#2ab600]/10 px-3 py-1 text-xs font-semibold text-[#2ab600]">
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 capitalize">
                        {order.paymentStatus || "Pending"}
                      </td>

                      <td className="py-4 font-semibold">
                        Rs. {order.totalAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
