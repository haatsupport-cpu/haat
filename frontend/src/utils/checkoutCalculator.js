// frontend/src/utils/checkoutCalculator.js
// Frontend utility for checkout calculations (mirrors backend logic)

const DELIVERY_CONFIG = {
  INSTANT: {
    baseFee: 50,
    nightSurcharge: 150,
  },
  SCHEDULED: {
    baseFee: 40,
    nightSurcharge: 40,
  },
  COD_FEE: 10,
  NIGHT_START_HOUR: 22, // 10 PM
  NIGHT_END_HOUR: 3, // 3 AM
};

/**
 * Check if time is within night surcharge hours
 */
export const isNightTime = (datetime = null) => {
  const date = datetime ? new Date(datetime) : new Date();
  const hour = date.getHours();
  return hour >= DELIVERY_CONFIG.NIGHT_START_HOUR || hour < DELIVERY_CONFIG.NIGHT_END_HOUR;
};

/**
 * Calculate delivery fee
 */
export const calculateDeliveryFee = (deliveryType, deliveryDateTime = null) => {
  if (deliveryType === "instant") {
    const checkTime = deliveryDateTime || new Date();
    return isNightTime(checkTime)
      ? DELIVERY_CONFIG.INSTANT.baseFee + DELIVERY_CONFIG.INSTANT.nightSurcharge
      : DELIVERY_CONFIG.INSTANT.baseFee;
  }
  return DELIVERY_CONFIG.SCHEDULED.baseFee;
};

/**
 * Calculate total with all charges
 */
export const calculateTotal = ({
  subtotal,
  deliveryFee,
  codFee,
  promoDiscount,
}) => {
  const total = subtotal + deliveryFee + codFee - promoDiscount;
  return Math.max(0, Math.round(total * 100) / 100);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Validate delivery date/time
 */
export const validateDeliveryDateTime = (deliveryDateTime) => {
  if (!deliveryDateTime) {
    return { valid: false, error: "Delivery date/time required" };
  }

  const selectedTime = new Date(deliveryDateTime);
  const now = new Date();
  const minTime = new Date(now.getTime() + 30 * 60000); // 30 mins from now

  if (selectedTime < minTime) {
    return { valid: false, error: "Schedule at least 30 minutes from now" };
  }

  return { valid: true, error: null };
};

export default {
  isNightTime,
  calculateDeliveryFee,
  calculateTotal,
  formatCurrency,
  validateDeliveryDateTime,
  DELIVERY_CONFIG,
};
