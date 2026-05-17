// frontend/src/pages/Checkout.jsx
// Complete checkout page with all components

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../context/useAuth";
import axiosClient from "../utils/axiosClient";
import DeliverySelector from "../components/Checkout/DeliverySelector";
import AddressForm from "../components/Checkout/AddressForm";
import PaymentPromoSection from "../components/Checkout/PaymentPromoSection";
import BillPreview from "../components/Checkout/BillPreview";
import {
  calculateDeliveryFee,
  calculateTotal,
  isNightTime,
} from "../utils/checkoutCalculator";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State - Cart Items
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);

  // State - Form
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    landmark: "",
    deliveryType: "instant",
    scheduledDateTime: "",
    paymentMode: "online",
  });

  // State - Promo
  const [promoCode, setPromoCode] = useState("");
  const [promoValid, setPromoValid] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoId, setPromoId] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // State - Pricing
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [codFee, setCodFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // State - Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const addressError = null;

  // Fetch cart on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        setCartLoading(true);
        const response = await axiosClient.get(`/api/cart?userId=${user.id}`);
        const items = response.data.items || [];

        if (items.length === 0) {
          setCartError("Your cart is empty");
          return;
        }

        setCartItems(items);
        const subtotalAmount = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setSubtotal(subtotalAmount);
      } catch (err) {
        setCartError(err.response?.data?.message || "Failed to load cart");
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  // Calculate pricing whenever relevant fields change
  useEffect(() => {
    const fee = calculateDeliveryFee(
      formData.deliveryType,
      formData.scheduledDateTime
        ? new Date(formData.scheduledDateTime)
        : null
    );
    setDeliveryFee(fee);

    const codFeeAmount = formData.paymentMode === "cod" ? 10 : 0;
    setCodFee(codFeeAmount);

    const total = calculateTotal({
      subtotal,
      deliveryFee: fee,
      codFee: codFeeAmount,
      promoDiscount,
    });
    setTotalAmount(total);
  }, [
    formData.deliveryType,
    formData.scheduledDateTime,
    formData.paymentMode,
    subtotal,
    promoDiscount,
  ]);

  // Handle promo code validation
  const handleApplyPromo = async (code) => {
    try {
      setPromoLoading(true);
      setPromoError("");
      setPromoValid(false);

      const response = await axiosClient.post("/api/checkout/validate-promo", {
        promoCode: code.trim().toUpperCase(),
        subtotal,
      });

      setPromoValid(true);
      setPromoCode(response.data.code);
      setPromoDiscount(response.data.discountAmount);
      setPromoId(response.data.promoId);
    } catch (err) {
      setPromoError(err.response?.data?.message || "Invalid promo code");
      setPromoValid(false);
      setPromoDiscount(0);
      setPromoId(null);
    } finally {
      setPromoLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setSubmitError("Please enter your name");
      return false;
    }

    if (!/^\d{10}$/.test(formData.customerPhone.replace(/\D/g, ""))) {
      setSubmitError("Please enter a valid 10-digit phone number");
      return false;
    }

    if (!formData.deliveryAddress.trim()) {
      setSubmitError("Please enter your delivery address");
      return false;
    }

    if (!formData.landmark.trim()) {
      setSubmitError("Please enter a landmark");
      return false;
    }

    if (
      formData.deliveryType === "scheduled" &&
      !formData.scheduledDateTime
    ) {
      setSubmitError("Please select a delivery date and time");
      return false;
    }

    return true;
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.product_id || item.id,
          quantity: item.quantity,
        })),
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        landmark: formData.landmark.trim(),
        deliveryType: formData.deliveryType,
        scheduledDeliveryAt: formData.scheduledDateTime || null,
        paymentMode: formData.paymentMode,
        promoCodeId: promoId,
        promoDiscount,
        deliveryFee,
        codFee,
        subtotal,
        totalAmount,
      };

      const response = await axiosClient.post(
        "/api/checkout/create-order",
        orderData
      );

      setOrderSuccess(true);
      setOrderNumber(response.data.orderNumber);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/orders");
      }, 3000);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Empty cart state
  if (cartError || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-slate-200 bg-white p-12 text-center"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-slate-600 mb-8">
              Add some items to your cart before checking out
            </p>
            <button
              onClick={() => navigate("/products")}
              className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-green-300 bg-white p-12 text-center shadow-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-600 mb-6">
              Thank you for your order. Your delivery is on the way!
            </p>
            <div className="rounded-2xl bg-green-50 p-4 mb-8">
              <p className="text-sm text-slate-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
            </div>
            <p className="text-slate-600 mb-4">
              Redirecting to your orders...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Checkout form
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          <button
            onClick={() => navigate("/cart")}
            className="rounded-full p-2 hover:bg-white transition"
          >
            <ArrowLeft className="h-6 w-6 text-slate-900" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Checkout</h1>
            <p className="text-slate-600">Complete your order</p>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Selector */}
            <DeliverySelector
              deliveryType={formData.deliveryType}
              setDeliveryType={(type) =>
                setFormData((prev) => ({ ...prev, deliveryType: type }))
              }
              scheduledDateTime={formData.scheduledDateTime}
              setScheduledDateTime={(dateTime) =>
                setFormData((prev) => ({
                  ...prev,
                  scheduledDateTime: dateTime,
                }))
              }
              deliveryFee={deliveryFee}
            />

            {/* Address Form */}
            <AddressForm
              formData={formData}
              setFormData={setFormData}
              error={addressError}
              setError={() => {}}
            />

            {/* Payment & Promo */}
            <PaymentPromoSection
              paymentMode={formData.paymentMode}
              setPaymentMode={(mode) =>
                setFormData((prev) => ({ ...prev, paymentMode: mode }))
              }
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoValid={promoValid}
              promoError={promoError}
              promoDiscount={promoDiscount}
              onApplyPromo={handleApplyPromo}
              loading={promoLoading}
            />

            {/* Submit Error */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-red-600"
              >
                <span>{submitError}</span>
              </motion.div>
            )}

            {/* Place Order Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 font-bold text-white transition hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </motion.button>
          </div>

          {/* Bill Preview */}
          <div>
            <BillPreview
              cartItems={cartItems}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              codFee={codFee}
              promoDiscount={promoDiscount}
              totalAmount={totalAmount}
              customerName={formData.customerName}
              customerPhone={formData.customerPhone}
              deliveryAddress={formData.deliveryAddress}
              landmark={formData.landmark}
              deliveryType={formData.deliveryType}
              paymentMode={formData.paymentMode}
              promoCode={promoCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
