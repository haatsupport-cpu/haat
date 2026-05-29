// backend/utils/promoValidator.js
// Utility for validating and calculating promo discounts

/**
 * Calculate discount amount based on promo code and subtotal
 * @param {Object} promo - Promo code record from database
 * @param {number} subtotal - Order subtotal
 * @returns {Object} { discountAmount: number, error: string|null }
 */
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

  const minOrderAmount = Number(promo.minOrderAmount ?? promo.min_order_amount ?? 0);
  const discountType = promo.discountType ?? promo.discount_type ?? "percentage";
  const discountValue = Number(promo.discountValue ?? promo.discount_value ?? 0);
  const maxDiscountAmount = Number(promo.maxDiscountAmount ?? promo.max_discount_amount ?? 0);
  const safeSubtotal = Number(subtotal) || 0;

  // Check minimum order amount
  if (safeSubtotal < minOrderAmount) {
    return {
      discountAmount: 0,
      error: `Minimum order amount Rs. ${minOrderAmount} required`,
    };
  }

  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = (safeSubtotal * discountValue) / 100;
    // Cap at maxDiscountAmount if set
    if (maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, maxDiscountAmount);
    }
  } else if (discountType === "fixed") {
    discountAmount = discountValue;
  }

  discountAmount = Math.min(discountAmount, safeSubtotal);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    error: null,
  };
};

/**
 * Validate promo code eligibility
 * @param {Object} promo - Promo code record from database
 * @param {string} [deliveryType] - Checkout delivery type (instant/scheduled)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePromoCode = (promo, deliveryType = null) => {
  if (!promo) {
    return { valid: false, error: "Promo code not found" };
  }

  const isActive = promo.isActive ?? promo.is_active;
  const expiresAt = promo.expiresAt ?? promo.expiry_date;
  const maxUses = Number(promo.maxUses ?? promo.max_uses ?? 0);
  const uses = Number(promo.uses ?? promo.current_uses ?? 0);

  if (!isActive) {
    return { valid: false, error: "Promo code is inactive" };
  }

  if (expiresAt && new Date(expiresAt) < new Date()) {
    return { valid: false, error: "Promo code has expired" };
  }

  if (maxUses && uses >= maxUses) {
    return { valid: false, error: "Promo code usage limit reached" };
  }

  if (deliveryType) {
    const deliveryOptions = promo.deliveryOptions ?? ["instant", "scheduled"];
    const normalizedType = deliveryType.toLowerCase();
    if (!deliveryOptions.includes(normalizedType)) {
      const allowedStr = deliveryOptions.join(" or ");
      throw new Error(`This coupon is only valid for ${allowedStr} delivery orders.`);
    }
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

  const discountType = promo.discountType ?? promo.discount_type ?? "percentage";
  const discountValue = promo.discountValue ?? promo.discount_value;
  const maxUses = promo.maxUses ?? promo.max_uses;
  const uses = promo.uses ?? promo.current_uses;
  const discountText =
    discountType === "percentage"
      ? `${discountValue}% off`
      : `Rs. ${discountValue} off`;

  return {
    id: promo.id ?? promo._id?.toString(),
    code: promo.code,
    description: promo.description,
    discountText,
    discountType,
    discountValue,
    minOrderAmount: promo.minOrderAmount ?? promo.min_order_amount ?? 0,
    deliveryOptions: promo.deliveryOptions ?? ["instant", "scheduled"],
    expiryDate: promo.expiresAt ?? promo.expiry_date ?? null,
    activeStatus: promo.isActive ?? promo.is_active,
    usesRemaining: maxUses
      ? Math.max(0, maxUses - uses)
      : "unlimited",
  };
};

export default {
  calculatePromoDiscount,
  validatePromoCode,
  formatPromoDetails,
};
