// frontend/src/components/Checkout/BillPreview.jsx
// Live bill preview component

import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/checkoutCalculator";

export default function BillPreview({
  cartItems,
  subtotal,
  deliveryFee,
  codFee,
  promoDiscount,
  totalAmount,
  customerName,
  customerPhone,
  deliveryAddress,
  landmark,
  deliveryType,
  paymentMode,
  promoCode,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-24 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-lg"
    >
      <h3 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h3>

      {/* Items */}
      <div className="mb-4 space-y-2 border-b border-slate-200 pb-4">
        {cartItems.map((item) => (
          <div
            key={item.cartItemId || item.id}
            className="flex justify-between text-sm text-slate-700"
          >
            <span>
              {item.name} x{item.quantity}
            </span>
            <span className="font-medium">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Charges Breakdown */}
      <div className="mb-4 space-y-2 border-b border-slate-200 pb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Delivery</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(deliveryFee)}
          </span>
        </div>

        {codFee > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">COD Fee</span>
            <span className="font-medium text-slate-900">
              {formatCurrency(codFee)}
            </span>
          </div>
        )}

        {promoDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Promo Discount</span>
            <span className="font-medium">-{formatCurrency(promoDiscount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mb-6 flex justify-between rounded-2xl bg-green-50 p-3">
        <span className="font-bold text-slate-900">Total Amount</span>
        <span className="text-2xl font-bold text-green-600">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Delivery Details */}
      {customerName && (
        <div className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">{customerName}</p>
            <p>{customerPhone}</p>
          </div>
          {deliveryAddress && (
            <div>
              <p className="font-semibold text-slate-700 mt-2">
                {deliveryType === "instant"
                  ? "Instant Delivery"
                  : "Scheduled Delivery"}
              </p>
              <p className="mt-1">{deliveryAddress}</p>
              {landmark && <p className="text-slate-500">Landmark: {landmark}</p>}
            </div>
          )}
          <p className="mt-2 font-semibold">
            Payment: {paymentMode === "cod" ? "Cash on Delivery" : "Online"}
          </p>
        </div>
      )}
    </motion.div>
  );
}
