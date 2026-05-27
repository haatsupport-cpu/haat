// frontend/src/components/Checkout/AddressForm.jsx
// Component for collecting delivery address

import { motion as Motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function AddressForm({
  formData,
  setFormData,
  error,
  setError,
}) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const validatePhone = (phoneno) => {
    return /^\d{10}$/.test(phoneno.replace(/\D/g, ""));
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">Delivery Address</h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
        </div>

        {/* phoneno */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            phoneno Number *
          </label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handleChange("customerPhone", e.target.value)}
            placeholder="98612345678"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
          {formData.customerPhone &&
            !validatePhone(formData.customerPhone) && (
              <p className="mt-1 text-xs text-red-500">
                phoneno must be 10 digits
              </p>
            )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Delivery Address *
        </label>
        <textarea
          value={formData.deliveryAddress}
          onChange={(e) => handleChange("deliveryAddress", e.target.value)}
          placeholder="Street address, building, etc."
          rows={3}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nearest Landmark *
        </label>
        <input
          type="text"
          value={formData.landmark}
          onChange={(e) => handleChange("landmark", e.target.value)}
          placeholder="Nearby reference point (e.g., School, Temple)"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </Motion.div>
  );
}
