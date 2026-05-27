// frontend/src/components/Checkout/PaymentPromoSection.jsx
// Component for payment method and promo code

import { motion as Motion } from "framer-motion";
import { CreditCard, Tag, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function PaymentPromoSection({
  paymentMode,
  setPaymentMode,
  promoCode,
  promoValid,
  promoError,
  promoDiscount,
  onApplyPromo,
  loading,
}) {
  const [localPromo, setLocalPromo] = useState(promoCode);

  const handleApply = () => {
    if (localPromo.trim()) {
      onApplyPromo(localPromo.trim());
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* Payment Method */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Payment Method
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Online Payment */}
          <Motion.label
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
              paymentMode === "online"
                ? "border-green-500 bg-green-50"
                : "border-slate-200 bg-white hover:border-green-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMode === "online"}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-slate-900">Online Payment</p>
                <p className="text-sm text-slate-600">eSewa, Khalti, etc.</p>
              </div>
            </div>
          </Motion.label>

          {/* Cash on Delivery */}
          <Motion.label
            whileHover={{ scale: 1.02 }}
            className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
              paymentMode === "cod"
                ? "border-green-500 bg-green-50"
                : "border-slate-200 bg-white hover:border-green-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMode === "cod"}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-slate-900">
                  Cash on Delivery
                </p>
                <p className="text-sm text-slate-600">+Rs. 10 fee</p>
              </div>
            </div>
          </Motion.label>
        </div>
      </div>

      {/* Promo Code */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Promo Code
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={localPromo}
            onChange={(e) => setLocalPromo(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            disabled={loading || promoValid}
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleApply}
            disabled={loading || promoValid || !localPromo.trim()}
            className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : promoValid ? "Applied" : "Apply"}
          </button>
        </div>

        {/* Promo Status */}
        {promoValid && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Promo code applied! Discount: Rs. {promoDiscount.toFixed(2)}
          </Motion.div>
        )}

        {promoError && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            <AlertCircle className="h-4 w-4" />
            {promoError}
          </Motion.div>
        )}
      </div>
    </Motion.div>
  );
}
