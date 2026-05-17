// backend/utils/promoValidator.js
// Utility for validating and calculating promo discounts

/**
 * Calculate discount amount based on promo code and subtotal
 * @param {Object} promo - Promo code record from database
 * @param {number} subtotal - Order subtotal
 * @returns {Object} { discountAmount: number, error: string|null }
 */
export const calculatePromoDiscount = (promo, subtotal) => {
  if (!promo) {
    return { discountAmount: 0, error: null };
  }

  // Check minimum order amount
  if (subtotal < (promo.min_order_amount || 0)) {
    return {
      discountAmount: 0,
      error: `Minimum order amount Rs. ${promo.min_order_amount} required`,
    };
  }

  let discountAmount = 0;

  if (promo.discount_type === "percentage") {
    discountAmount = (subtotal * promo.discount_value) / 100;
    // Cap at max_discount_amount if set
    if (promo.max_discount_amount) {
      discountAmount = Math.min(discountAmount, promo.max_discount_amount);
    }
  } else if (promo.discount_type === "fixed") {
    discountAmount = promo.discount_value;
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    error: null,
  };
};

/**
 * Validate promo code eligibility
 * @param {Object} promo - Promo code record from database
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePromoCode = (promo) => {
  if (!promo) {
    return { valid: false, error: "Promo code not found" };
  }

  if (!promo.is_active) {
    return { valid: false, error: "Promo code is inactive" };
  }

  if (new Date(promo.expiry_date) < new Date()) {
    return { valid: false, error: "Promo code has expired" };
  }

  if (promo.max_uses && promo.current_uses >= promo.max_uses) {
    return { valid: false, error: "Promo code usage limit reached" };
  }

  return { valid: true, error: null };
};

/**
 * Format promo code details for frontend
 * @param {Object} promo - Promo code record
 * @returns {Object} Formatted promo details
 */
export const formatPromoDetails = (promo) => {
  if (!promo) return null;

  const discountText =
    promo.discount_type === "percentage"
      ? `${promo.discount_value}% off`
      : `Rs. ${promo.discount_value} off`;

  return {
    id: promo.id,
    code: promo.code,
    description: promo.description,
    discountText,
    minOrderAmount: promo.min_order_amount,
    expiryDate: new Date(promo.expiry_date),
    usesRemaining: promo.max_uses
      ? Math.max(0, promo.max_uses - promo.current_uses)
      : "unlimited",
  };
};

export default {
  calculatePromoDiscount,
  validatePromoCode,
  formatPromoDetails,
};
