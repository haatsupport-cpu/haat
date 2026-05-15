import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { axiosClient } from "../utils/axiosClient"

export default function Cart() {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCart = async () => {
    try {
      setLoading(true)

      if (!user?.id) {
        setError("Please login to view your cart")
        return
      }

      const response = await axiosClient.get(`/api/cart?userId=${user.id}`)
      setCartItems(response.data)
    } catch (err) {
      console.error("Error fetching cart:", err)
      setError("Failed to load cart. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id])

  const removeItem = async (item) => {
    try {
      setError(null)

      if (!user?.id) {
        alert("Please login to modify cart")
        return
      }

      const userId = user.id
      const itemId = item.cartItemId || item.id

      const response = await axiosClient.delete(
        `/api/cart/${itemId}?userId=${userId}`
      )
      setCartItems(response.data)
    } catch (err) {
      console.error("Failed to remove item:", err)
      alert("Unable to remove item. Please try again.")
    }
  }

  const updateQuantity = async (item, newQuantity) => {
    const finalQuantity = Math.max(1, newQuantity)

    try {
      if (!user?.id) {
        alert("Please login to modify cart")
        return
      }

      const userId = user.id
      const itemId = item.cartItemId || item.id

      const response = await axiosClient.put(
        `/api/cart/${itemId}`,
        {
          userId,
          quantity: finalQuantity,
        }
      )

      setCartItems(response.data)
    } catch (err) {
      console.error("Failed to update quantity:", err)
      alert("Unable to update quantity. Please try again.")
    }
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )
  const shippingFee = subtotal > 0 ? 100.0 : 0
  const total = subtotal + shippingFee

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-green-800 font-bold text-2xl">
        Loading your cart...
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
      <h1 className="text-4xl font-extrabold text-green-800 mb-8">
        🛒 Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <p className="text-xl text-gray-600">
            Your cart is empty. Time to stock up on fresh supplies!
          </p>
          <Link
            to="/products"
            className="inline-block mt-4 text-green-800 font-semibold hover:underline"
          >
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4 overflow-x-auto bg-white rounded-xl shadow-2xl p-4">
            <table className="min-w-full">
              <thead>
                <tr className="bg-green-800 text-white text-left text-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-xl">Product</th>
                  <th className="py-3 px-4 text-center">Price</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Subtotal</th>
                  <th className="py-3 px-4 rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-green-50/50 transition duration-150"
                  >
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">
                      Rs. {item.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="text-gray-600 border border-gray-300 w-8 h-8 rounded hover:bg-gray-200 transition"
                          disabled={item.quantity === 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="text-gray-600 border border-gray-300 w-8 h-8 rounded hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-700">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => removeItem(item)}
                        className="text-red-800 hover:text-red-600 transition text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:w-1/4 bg-white p-6 rounded-xl shadow-2xl h-fit">
            <h3 className="text-2xl font-bold text-green-800 mb-4 border-b pb-2">
              Order Summary
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>Rs. {shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 text-red-800">
                <span>Order Total:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full bg-green-800 text-white font-semibold text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 ease-in-out">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
