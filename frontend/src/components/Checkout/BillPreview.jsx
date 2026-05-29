import { motion as Motion } from "framer-motion";
import { formatCurrency } from "../../utils/checkoutCalculator";

export default function BillPreview({
  cartItems = [],
  subtotal = 0,
  deliveryFee = 0,
  codFee = 0,
  promoDiscount = 0,
  totalAmount = 0,
  customerName,
  customerPhone,
  deliveryAddress,
  landmark,
  deliveryType,
  paymentMode,
  promoCode,
}) {
  // SAFE NUMBERS
  const safeSubtotal = Number(subtotal) || 0;
  const safeDeliveryFee = Number(deliveryFee) || 0;
  const safeCodFee = Number(codFee) || 0;
  const safePromoDiscount = Number(promoDiscount) || 0;

  const safeTotal =
    Number(totalAmount) ||
    safeSubtotal +
      safeDeliveryFee +
      safeCodFee -
      safePromoDiscount;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-24 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-lg"
    >
      <h3 className="mb-4 text-lg font-bold text-slate-900">
        Order Summary
      </h3>

      {/* ITEMS */}
      <div className="mb-4 space-y-2 border-b border-slate-200 pb-4">
        {cartItems.map((item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          const unit = item.unit || "";

          return (
            <div
              key={item.cartItemId || item.id}
              className="flex justify-between text-sm text-slate-700"
            >
              <span>
                {item.name} x{quantity} /{unit}
              </span>


              <span className="font-medium">
                {formatCurrency(price * quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* CHARGES */}
      <div className="mb-4 space-y-2 border-b border-slate-200 pb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Subtotal</span>

          <span className="font-medium text-slate-900">
            {formatCurrency(safeSubtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Delivery</span>

          <span className="font-medium text-slate-900">
            {formatCurrency(safeDeliveryFee)}
          </span>
        </div>

        {safeCodFee > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">COD Fee</span>

            <span className="font-medium text-slate-900">
              {formatCurrency(safeCodFee)}
            </span>
          </div>
        )}

        {safePromoDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Promo Discount</span>

            <span className="font-medium">
              -{formatCurrency(safePromoDiscount)}
            </span>
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="mb-6 flex justify-between rounded-2xl bg-green-50 p-3">
        <span className="font-bold text-slate-900">
          Total Amount
        </span>

        <span className="text-2xl font-bold text-green-600">
          {formatCurrency(safeTotal)}
        </span>
      </div>

      {/* DELIVERY DETAILS */}
      {customerName && (
        <div className="space-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">
              {customerName}
            </p>

            <p>{customerPhone}</p>
          </div>

          {deliveryAddress && (
            <div>
              <p className="mt-2 font-semibold text-slate-700">
                {deliveryType === "instant"
                  ? "Instant Delivery"
                  : "Scheduled Delivery"}
              </p>

              <p className="mt-1">{deliveryAddress}</p>

              {landmark && (
                <p className="text-slate-500">
                  Landmark: {landmark}
                </p>
              )}
            </div>
          )}

          <p className="mt-2 font-semibold">
            Payment:{" "}
            {paymentMode === "cod"
              ? "Cash on Delivery"
              : "Online"}
          </p>

          {promoCode && (
            <p className="text-green-600">
              Promo Applied: {promoCode}
            </p>
          )}
        </div>
      )}
    </Motion.div>
  );
}
