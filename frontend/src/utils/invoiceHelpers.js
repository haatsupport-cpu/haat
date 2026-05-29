
import { formatCurrency } from "./checkoutCalculator";

export const getNormalizedInvoiceData = (props) => {
  const safeSubtotal = Number(props.subtotal) || 0;
  const safeDeliveryFee = Number(props.deliveryFee) || 0;
  const safeCodFee = Number(props.codFee) || 0;
  const safePromoDiscount = Number(props.promoDiscount) || 0;

  const safeTotal =
    Number(props.totalAmount) ||
    safeSubtotal + safeDeliveryFee + safeCodFee - safePromoDiscount;

  // Fallback defaults for missing details
  const orderNumber = props.orderNumber || props.orderId || "N/A";
  const orderDate = props.orderDate || new Date().toLocaleString();

  return {
    ...props,
    safeSubtotal,
    safeDeliveryFee,
    safeCodFee,
    safePromoDiscount,
    safeTotal,
    orderNumber,
    orderDate,
    cartItems: props.cartItems || [],
  };
};