// frontend/src/components/Checkout/DeliverySelector.jsx
// Component for selecting delivery type (Instant vs Scheduled)

import { motion } from "framer-motion";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { isNightTime } from "../../utils/checkoutCalculator";

export default function DeliverySelector({
  deliveryType,
  setDeliveryType,
  scheduledDateTime,
  setScheduledDateTime,
  deliveryFee,
}) {
  const isNight = isNightTime(scheduledDateTime);
  const nightChargeText =
    isNight && deliveryType === "instant"
      ? " (includes night surcharge)"
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-3xl border border-green-200/30 bg-gradient-to-br from-green-50 to-emerald-50 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900">Delivery Options</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Instant Delivery */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
            deliveryType === "instant"
              ? "border-green-500 bg-white shadow-lg"
              : "border-slate-200 bg-white hover:border-green-300"
          }`}
        >
          <input
            type="radio"
            name="deliveryType"
            value="instant"
            checked={deliveryType === "instant"}
            onChange={(e) => setDeliveryType(e.target.value)}
            className="hidden"
          />
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-green-600 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Instant Delivery</p>
              <p className="text-sm text-slate-600">Delivered today</p>
              <p className="mt-2 text-lg font-bold text-green-600">
                Rs. {deliveryFee}
                {nightChargeText}
              </p>
            </div>
          </div>
        </motion.label>

        {/* Scheduled Delivery */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
            deliveryType === "scheduled"
              ? "border-green-500 bg-white shadow-lg"
              : "border-slate-200 bg-white hover:border-green-300"
          }`}
        >
          <input
            type="radio"
            name="deliveryType"
            value="scheduled"
            checked={deliveryType === "scheduled"}
            onChange={(e) => setDeliveryType(e.target.value)}
            className="hidden"
          />
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <p className="font-semibold text-slate-900">Scheduled Delivery</p>
              <p className="text-sm text-slate-600">Choose date & time</p>
              <p className="mt-2 text-lg font-bold text-blue-600">Rs. {deliveryFee}</p>
            </div>
          </div>
        </motion.label>
      </div>

      {/* Scheduled Delivery Picker */}
      {deliveryType === "scheduled" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 pt-4 border-t border-slate-200"
        >
          <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-2">
              Select Delivery Date & Time
            </span>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </label>

          {!scheduledDateTime && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4" />
              Please select a delivery date and time
            </div>
          )}
        </motion.div>
      )}

      {/* Night Charge Info */}
      {deliveryType === "instant" && isNight && (
        <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
          <AlertCircle className="h-4 w-4" />
          Night surcharge applied (10 PM - 3 AM)
        </div>
      )}
    </motion.div>
  );
}
