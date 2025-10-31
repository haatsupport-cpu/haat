import { useState } from "react"
import { Link } from "react-router-dom" // Added Link import for the empty cart state

export default function Cart() {
  // Example cart items (replace with real data later)
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Apple", price: 2.5, quantity: 3 },
    { id: 2, name: "Banana", price: 1.25, quantity: 5 },
    { id: 3, name: "Milk (1L)", price: 3.75, quantity: 2 },
  ])

  // --- HANDLER FUNCTIONS ---

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    const finalQuantity = Math.max(1, newQuantity)

    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: finalQuantity } : item
      )
    )
  }

  // Calculate total price
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  // Assuming a fixed shipping fee for this example. Keeping 100.0 as requested.
  const shippingFee = subtotal > 0 ? 100.0 : 0
  const total = subtotal + shippingFee

  // --- RENDER COMPONENT ---

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Changed heading color to Deep Blue for theme consistency */}
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
          {/* Cart Items Table (70% width on large screens) */}
          <div className="lg:w-3/4 overflow-x-auto bg-white rounded-xl shadow-2xl p-4">
            <table className="min-w-full">
              <thead>
                {/* Updated header background to Deep Blue */}
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

                    {/* Quantity Controls */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="text-gray-600 border border-gray-300 w-8 h-8 rounded hover:bg-gray-200 transition"
                          disabled={item.quantity === 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
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
                        onClick={() => removeItem(item.id)}
                        className="text-red-800 hover:text-red-800 transition text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary Card (30% width on large screens) */}
          <div className="lg:w-1/4 bg-white p-6 rounded-xl shadow-2xl h-fit">
            {/* Changed title color to Deep Blue for theme consistency */}
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
              {/* Changed total color to Deep Blue for theme consistency */}
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 text-red-800">
                <span>Order Total:</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button - Mint Green */}
            <button className="w-full bg-green-800 text-white font-semibold text-lg px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 ease-in-out">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
