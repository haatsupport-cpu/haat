// backend/utils/pricingCalculator.js
// Utility for calculating dynamic delivery fees and order totals

const DELIVERY_CONFIG = {
  INSTANT: {
    name: "instant",
    baseFee: 50, // Rs. 50
    nightSurcharge: 150, // Rs. 150 from 10 PM to 3 AM
    minOrderAmount: 0,
  },
  SCHEDULED: {
    name: "scheduled",
    baseFee: 40, // Rs. 40
    nightSurcharge: 40, // No additional surcharge
    minOrderAmount: 0,
  },
  COD_FEE: 10, // Rs. 10 for Cash on Delivery
  NIGHT_START_HOUR: 22, // 10 PM
  NIGHT_END_HOUR: 3, // 3 AM
};

/**
 * Check if current time falls within night surcharge hours (10 PM - 3 AM)
 * @param {Date|null} datetime - Optional datetime to check. Defaults to now.
 * @returns {boolean}
 */
export const isNightTime = (datetime = null) => {
  const date = datetime ? new Date(datetime) : new Date();
  const hour = date.getHours();
  // 10 PM (22) onwards or before 3 AM (3)
  return hour >= DELIVERY_CONFIG.NIGHT_START_HOUR || hour < DELIVERY_CONFIG.NIGHT_END_HOUR;
};

/**
 * Calculate delivery fee based on delivery type and time
 * @param {string} deliveryType - 'instant' or 'scheduled'
 * @param {Date|null} deliveryDateTime - When delivery is scheduled. Null for instant.
 * @returns {number} Delivery fee in Rs.
 */
export const calculateDeliveryFee = (deliveryType, deliveryDateTime = null) => {
  if (deliveryType === DELIVERY_CONFIG.INSTANT.name) {
    const checkTime = deliveryDateTime || new Date();
    const isNight = isNightTime(checkTime);
    return isNight
      ? DELIVERY_CONFIG.INSTANT.baseFee + DELIVERY_CONFIG.INSTANT.nightSurcharge
      : DELIVERY_CONFIG.INSTANT.baseFee;
  }

  if (deliveryType === DELIVERY_CONFIG.SCHEDULED.name) {
    // Scheduled deliveries have fixed rate, no surcharge
    return DELIVERY_CONFIG.SCHEDULED.baseFee;
  }

  return DELIVERY_CONFIG.INSTANT.baseFee; // Default fallback
};

/**
 * Calculate COD (Cash on Delivery) fee
 * @param {string} paymentMode - 'online' or 'cod'
 * @returns {number} COD fee in Rs.
 */
export const calculateCODFee = (paymentMode) => {
  return paymentMode === "cod" ? DELIVERY_CONFIG.COD_FEE : 0;
};

/**
 * Calculate total order amount
 * @param {Object} params
 * @param {number} params.subtotal - Subtotal of items
 * @param {number} params.deliveryFee - Calculated delivery fee
 * @param {number} params.codFee - Calculated COD fee
 * @param {number} params.promoDiscount - Applied promo discount
 * @returns {number} Total amount
 */
export const calculateTotal = ({ subtotal, deliveryFee, codFee, promoDiscount }) => {
  const total = subtotal + deliveryFee + codFee - promoDiscount;
  return Math.max(0, Math.round(total * 100) / 100); // Round to 2 decimals
};

/**
 * Validate if a delivery datetime is in the future
 * @param {Date|string} deliveryDateTime
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateDeliveryDateTime = (deliveryDateTime) => {
  if (!deliveryDateTime) {
    return { valid: false, error: "Delivery date/time is required" };
  }

  const selectedTime = new Date(deliveryDateTime);
  const now = new Date();
  const minScheduleTime = new Date(now.getTime() + 30 * 60000); // Min 30 mins from now

  if (selectedTime < minScheduleTime) {
    return { valid: false, error: "Scheduled delivery must be at least 30 minutes from now" };
  }

  return { valid: true, error: null };
};

/**
 * Get delivery config (useful for frontend)
 * @returns {Object} Pricing config
 */
export const getDeliveryConfig = () => ({
  instant: DELIVERY_CONFIG.INSTANT,
  scheduled: DELIVERY_CONFIG.SCHEDULED,
  codFee: DELIVERY_CONFIG.COD_FEE,
  nightStartHour: DELIVERY_CONFIG.NIGHT_START_HOUR,
  nightEndHour: DELIVERY_CONFIG.NIGHT_END_HOUR,
});

export default {
  DELIVERY_CONFIG,
  isNightTime,
  calculateDeliveryFee,
  calculateCODFee,
  calculateTotal,
  validateDeliveryDateTime,
  getDeliveryConfig,
};
