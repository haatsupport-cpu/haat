// backend/utils/orderGenerator.js
// Utility for generating order numbers and formatting order data

import crypto from "crypto";

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-RANDOMHEX
 * @returns {string} Unique order number
 */
export const generateOrderNumber = () => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
};

/**
 * Format order data for database storage
 * @param {Object} params - Checkout data
 * @returns {Object} Formatted order data
 */
export const formatOrderData = ({
  userId,
  customerName,
  customerPhone,
  deliveryAddress,
  landmark,
  deliveryType,
  scheduledDeliveryAt,
  paymentMode,
  items,
  promoCodeId,
  promoDiscount,
  deliveryFee,
  codFee,
  subtotal,
  totalAmount,
}) => ({
  user_id: userId,
  customer_name: (customerName || "").trim(),
  customer_phone: (customerPhone || "").trim(),
  delivery_address: (deliveryAddress || "").trim(),
  landmark: (landmark || "").trim(),
  delivery_type: deliveryType,
  scheduled_delivery_at: scheduledDeliveryAt || null,
  payment_mode: paymentMode,
  promo_code_id: promoCodeId || null,
  promo_discount: Math.max(0, promoDiscount),
  delivery_fee: Math.max(0, deliveryFee),
  cod_fee: Math.max(0, codFee),
  subtotal: Math.max(0, subtotal),
  total_amount: Math.max(0, totalAmount),
  items: items.map((item) => ({
    product_id: item.productId || item.product_id,
    quantity: Math.max(1, item.quantity),
  })),
});

export default {
  generateOrderNumber,
  formatOrderData,
};
