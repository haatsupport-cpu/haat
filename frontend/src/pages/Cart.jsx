import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { cartService } from "../services/cart-service"
import { calculateDeliveryFee, validateDeliveryMinimum } from "../utils/checkoutCalculator"

export default function Cart() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deliveryType, setDeliveryType] = useState("instant")

  const fetchCart = async () => {
    try {
      setLoading(true)

      if (!user?.id) {
        setError("Please login to view your cart")
        return
      }

      const response = await cartService.getCart(user.id)
      setCartItems(response.data?.items || [])
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

      const response = await cartService.removeItem(itemId, userId)
      setCartItems(response.data?.items || [])
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

      const response = await cartService.updateItemQuantity(itemId, {
        userId,
        quantity: finalQuantity,
      })

      setCartItems(response.data?.items || [])
    } catch (err) {
      console.error("Failed to update quantity:", err)
      alert("Unable to update quantity. Please try again.")
    }
  }

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )
  const deliveryValidation = validateDeliveryMinimum(deliveryType, subtotal)
  const shippingFee = cartItems.length > 0
    ? calculateDeliveryFee(deliveryType, null, { subtotal, isFirstOrder: false })
    : 0
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
              <div className="space-y-2 rounded-xl bg-gray-50 p-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Delivery Option
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-700"
                >
                  <option value="instant">Instant Delivery</option>
                  <option value="scheduled">Scheduled Delivery</option>
                </select>
                {!deliveryValidation.valid && (
                  <p className="text-sm font-medium text-red-600">
                    {deliveryValidation.error}
                  </p>
                )}
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 text-red-800">
                <span>Order Total:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout", { state: { deliveryType } })}
              disabled={!deliveryValidation.valid}
              className="w-full bg-green-800 text-white font-semibold text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
