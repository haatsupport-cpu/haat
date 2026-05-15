import { Link } from "react-router-dom"

export default function LoginToOrderModal({ open, onClose }) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-to-order-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="login-to-order-title"
          className="text-xl font-bold text-gray-900"
        >
          Login to order
        </h2>
        <p className="text-gray-600 mt-2">
          Sign in to add items to your cart and complete your order.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-w-[6rem] px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Not now
          </button>
          <Link
            to="/login"
            onClick={onClose}
            className="flex-1 min-w-[6rem] text-center px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
