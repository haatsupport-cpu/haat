import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { cartService } from "../services/cart-service";
import { checkoutService } from "../services/checkout-service";
import { orderService } from "../services/order-service";
import DeliverySelector from "../components/checkout/DeliverySelector";
import Deliverylocation from "../components/checkout/Deliverylocation";
import AddressForm from "../components/checkout/AddressForm";
import PaymentPromoSection from "../components/checkout/PaymentPromoSection";
import {
  calculateDeliveryFee,
  calculateTotal,
  validateDeliveryMinimum,
  formatCurrency,
} from "../utils/checkoutCalculator";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
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
    lat: 27.42949558266496,
    lng: 85.03280181607856,
    label: "Home",
    landmark: "",
    deliveryType: location.state?.deliveryType === "scheduled" ? "scheduled" : "instant",
    scheduledDateTime: "",
    paymentMode: "online",
  });

  // Slots - scheduled delivery
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

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
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  // State - Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const addressError = null;

  // ============================================
  // Scheduled Delivery Slots (Auto Smart Slots)
  // ============================================
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    let slots = [];

    if (currentHour < 9) {
      slots.push({
        label: "Morning Slot (8:00 AM - 10:00 AM)",
        value: "08:00",
        date: new Date(),
      });
    }

    if (currentHour < 16) {
      slots.push({
        label: "Afternoon Slot (4:00 PM - 6:00 PM)",
        value: "16:00",
        date: new Date(),
      });
    }

    if (currentHour < 21) {
      slots.push({
        label: "Evening Slot (9:00 PM - 10:00 PM)",
        value: "21:00",
        date: new Date(),
      });
    }

    if (slots.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      slots.push({
        label: "Tomorrow Morning (8:00 AM - 11:00 AM)",
        value: "08:00",
        date: tomorrow,
      });
    }

    setAvailableSlots(slots);

    if (slots.length > 0) {
      const firstSlot = slots[0];
      const yyyy = firstSlot.date.getFullYear();
      const mm = String(firstSlot.date.getMonth() + 1).padStart(2, "0");
      const dd = String(firstSlot.date.getDate()).padStart(2, "0");
      const fullDateTime = `${yyyy}-${mm}-${dd}T${firstSlot.value}:00`;

      setSelectedSlot(firstSlot.value);
      setFormData((prev) => ({
        ...prev,
        scheduledDateTime: fullDateTime,
      }));
    }
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        setCartLoading(true);
        const response = await cartService.getCart(user.id);
        const items = response.data.items || [];

        if (items.length === 0) {
          setCartError("Your cart is empty");
          return;
        }

        setCartItems(items);

        const subtotalAmount = items.reduce((sum, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return sum + price * quantity;
        }, 0);

        setSubtotal(subtotalAmount);

        try {
          const orderRes = await orderService.list();
          const orders = orderRes.data?.orders || orderRes.data?.data || orderRes.data || [];
          setIsFirstOrder(Array.isArray(orders) && orders.length === 0);
        } catch {
          setIsFirstOrder(false);
        }
      } catch (err) {
        setCartError(err.response?.data?.message || "Failed to load cart");
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  // Client-side distance & surcharge calculations
  const SHOP_LAT = Number(import.meta.env.VITE_SHOP_LAT || 27.429280726769314);
  const SHOP_LNG = Number(import.meta.env.VITE_SHOP_LNG || 85.03281182486674);

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some((v) => v === null || v === undefined)) return null;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const distanceKm =
    formData.lat && formData.lng
      ? haversineKm(SHOP_LAT, SHOP_LNG, Number(formData.lat), Number(formData.lng))
      : null;
  const baseRadius = 15;
  const excessKm = distanceKm && distanceKm > baseRadius ? Number((distanceKm - baseRadius).toFixed(2)) : 0;
  const surcharge = excessKm ? excessKm * 25 : 0;

  // Calculate pricing
  useEffect(() => {
    let trackingDate = null;
    if (formData.deliveryType === "scheduled" && formData.scheduledDateTime) {
      trackingDate = new Date(formData.scheduledDateTime);
    } else if (formData.deliveryType === "instant") {
      trackingDate = new Date();
    }

    const fee = calculateDeliveryFee(formData.deliveryType, trackingDate, {
      subtotal,
      isFirstOrder,
    });

    setDeliveryFee(fee);

    const codFeeAmount = formData.paymentMode === "cod" ? 10 : 0;
    setCodFee(codFeeAmount);

    const baseTotal = calculateTotal({
      subtotal,
      deliveryFee: fee,
      codFee: codFeeAmount,
      promoDiscount,
    });

    setTotalAmount(baseTotal);
  }, [
    formData.deliveryType,
    formData.scheduledDateTime,
    formData.paymentMode,
    subtotal,
    promoDiscount,
    isFirstOrder,
  ]);

  const displayedDeliveryFee = Number((Number(deliveryFee || 0) + surcharge).toFixed(2));
  const displayedTotal = Number((Number(totalAmount || 0) + surcharge).toFixed(2));
  const deliveryValidation = validateDeliveryMinimum(formData.deliveryType, subtotal);

  // Handle promo code validation
  const handleApplyPromo = async (code) => {
    try {
      setPromoLoading(true);
      setPromoError("");
      setPromoValid(false);

      const response = await checkoutService.validatePromo({
        promoCode: code.trim().toUpperCase(),
        subtotal,
        deliveryType: formData.deliveryType,
      });

      setPromoValid(true);
      setPromoCode(response.data.promoCode || response.data.code);
      setPromoDiscount(response.data.discount ?? response.data.discountAmount);
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

  // Re-validate applied promo reactively if delivery type changes
  useEffect(() => {
    if (promoValid && promoCode) {
      handleApplyPromo(promoCode);
    }
  }, [formData.deliveryType]);

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

    const hasValidCoordinates = Number.isFinite(formData.lat) && Number.isFinite(formData.lng);
    if (!hasValidCoordinates) {
      setSubmitError("Please select delivery location on map");
      return false;
    }

    if (!formData.landmark.trim()) {
      setSubmitError("Please enter a landmark");
      return false;
    }

    if (formData.deliveryType === "scheduled" && (!formData.scheduledDateTime || !selectedSlot)) {
      setSubmitError("Please select scheduled delivery date and slot");
      return false;
    }

    if (!deliveryValidation.valid) {
      setSubmitError(deliveryValidation.error);
      return false;
    }

    return true;
  };

  useEffect(() => {
    const storedPromoCode = localStorage.getItem("checkoutPromoCode");
    if (storedPromoCode && subtotal > 0 && !promoValid && !promoLoading) {
      localStorage.removeItem("checkoutPromoCode");
      handleApplyPromo(storedPromoCode);
    }
  }, [subtotal]);

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const lat = Number(formData.lat);
    const lng = Number(formData.lng);

    try {
      setSubmitting(true);
      setSubmitError("");

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product_id || item.id,
          quantity: item.quantity,
        })),
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        deliveryAddress: formData.deliveryAddress.trim(),
        label: formData.label,
        landmark: formData.landmark.trim(),
        deliveryType: formData.deliveryType,
        paymentMode: formData.paymentMode,
        scheduledDeliveryAt: formData.scheduledDateTime || null,
        promoCodeId: promoId,
        promoDiscount,
        deliveryFee: displayedDeliveryFee,
        codFee,
        subtotal,
        totalAmount: displayedTotal,
      };

      const response = await checkoutService.createOrder(payload);
      setOrderSuccess(true);
      setOrderNumber(response.data.orderNumber || response.data.orderId || "");

      setTimeout(() => {
        navigate("/orders");
      }, 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (cartError || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-slate-200 bg-white p-12 text-center"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Cart is Empty</h1>
            <p className="text-slate-600 mb-8">Add some items to your cart before checking out</p>
            <button
              onClick={() => navigate("/products")}
              className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Continue Shopping
            </button>
          </Motion.div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-green-300 bg-white p-12 text-center shadow-xl"
          >
            <Motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            </Motion.div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-slate-600 mb-6">Thank you for your order. Your delivery is on the way!</p>
            <div className="rounded-2xl bg-green-50 p-4 mb-8">
              <p className="text-sm text-slate-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
            </div>
            <p className="text-slate-600 mb-4">Redirecting to your orders...</p>
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Motion.div
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
        </Motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form Elements */}
          <div className="lg:col-span-2 space-y-6">
            <DeliverySelector
              deliveryType={formData.deliveryType}
              setDeliveryType={(type) =>
                setFormData((prev) => ({ ...prev, deliveryType: type }))
              }
              scheduledDateTime={formData.scheduledDateTime}
              setScheduledDateTime={(dateTime) =>
                setFormData((prev) => ({ ...prev, scheduledDateTime: dateTime }))
              }
              deliveryFee={displayedDeliveryFee}
            />

            {!deliveryValidation.valid && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
                {deliveryValidation.error}
              </div>
            )}

            {/* Scheduled Slots */}
            {formData.deliveryType === "scheduled" && (
              <Motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white border border-slate-200 p-6 space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Scheduled Delivery</h2>
                  <p className="text-sm text-slate-500 mt-1">Available delivery slots</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.label}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot.value);
                        const yyyy = slot.date.getFullYear();
                        const mm = String(slot.date.getMonth() + 1).padStart(2, "0");
                        const dd = String(slot.date.getDate()).padStart(2, "0");
                        const fullDateTime = `${yyyy}-${mm}-${dd}T${slot.value}:00`;

                        setFormData((prev) => ({
                          ...prev,
                          scheduledDateTime: fullDateTime,
                        }));
                      }}
                      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition-all ${
                        selectedSlot === slot.value
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-green-300"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </Motion.div>
            )}

            <Deliverylocation formData={formData} setFormData={setFormData} />
            <AddressForm
              formData={formData}
              setFormData={setFormData}
              error={addressError}
              setError={() => {}}
            />

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

            {submitError && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-red-600"
              >
                <span>{submitError}</span>
              </Motion.div>
            )}

            {distanceKm !== null && (
              <div className="rounded-2xl bg-slate-100/70 border border-slate-200/60 p-4 text-xs text-slate-600 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-700">Fulfillment Radius: </span>
                  {distanceKm ? `${distanceKm.toFixed(2)} km away` : "—"}
                </div>
                {surcharge > 0 && (
                  <div className="text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/40">
                    Overage Surcharge (+Rs. {surcharge.toFixed(2)}) Included
                  </div>
                )}
              </div>
            )}

            <Motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handlePlaceOrder}
              disabled={submitting || !deliveryValidation.valid}
              className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 font-bold text-white transition hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-green-600/10"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Motion.button>
          </div>

          {/* Clean Local Breakdown Side Column */}
          <div className="relative">
            <div className="lg:sticky lg:top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100/50 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Summary Breakdown</h3>
              
              <div className="space-y-2 text-sm border-b border-slate-100 pb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-slate-800">{formatCurrency(displayedDeliveryFee)}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>COD Fee</span>
                    <span className="font-medium text-slate-800">{formatCurrency(codFee)}</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promo Discount</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(displayedTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}