export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getStatusLabel(status) {
  return {
    pending: "Pending",
    processing: "Processing",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown");
}

export function getPaymentLabel(paymentStatus) {
  return {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  }[paymentStatus] || (paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : "Unknown");
}
