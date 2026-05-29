export const DELIVERY_CONFIG = {
  INSTANT: {
    name: "instant",
    baseFee: 100,
    nightSurcharge: 100,
    minOrderAmount: 500,
  },
  SCHEDULED: {
    name: "scheduled",
    baseFee: 50,
    minOrderAmount: 300,
    timeSlots: [
      { id: "morning", label: "Morning", startHour: 9 },
      { id: "afternoon", label: "Afternoon", startHour: 13 },
      { id: "evening", label: "Evening", startHour: 17 },
    ],
  },
}

/**
 * Single source of truth for Night Checking
 * Accepts an optional date object or hour integer
 */
export const isNightTime = (dateOrHour = new Date()) => {
  // If a full Date object or date string is passed, extract the local hour safely
  const hour = dateOrHour instanceof Date 
    ? dateOrHour.getHours() 
    : typeof dateOrHour === "string" || typeof dateOrHour === "number" && !isNaN(dateOrHour)
      ? Number(dateOrHour)
      : new Date(dateOrHour).getHours();

  return hour >= 22 || hour <= 3;
}

export const normalizeDeliveryType = (deliveryType = "instant") => {
  return String(deliveryType).toLowerCase() === "scheduled" ? "scheduled" : "instant"
}

export const calculateDeliveryFee = (
  deliveryType = "instant",
  deliveryDateTime = null,
  options = {}
) => {
  const normalizedType = normalizeDeliveryType(deliveryType)
  const subtotal = Number(options.subtotal || 0)
  const isFirstOrder = Boolean(options.isFirstOrder)

  if (normalizedType === "scheduled" && isFirstOrder && subtotal > 500) {
    return 0
  }

  if (normalizedType === "scheduled") return DELIVERY_CONFIG.SCHEDULED.baseFee

  // Crucial Fix: Fallback immediately to a localized system date if deliveryDateTime is problematic
  let date = new Date();
  if (deliveryDateTime) {
    const parsedDate = new Date(deliveryDateTime);
    // Ensure the parsed date is valid before overriding
    if (!isNaN(parsedDate.getTime())) {
      date = parsedDate;
    }
  }

  // Use our unified helper function to eliminate double calculation logic
  const night = isNightTime(date);
  
  return night
    ? DELIVERY_CONFIG.INSTANT.baseFee + DELIVERY_CONFIG.INSTANT.nightSurcharge
    : DELIVERY_CONFIG.INSTANT.baseFee
}

export const validateDeliveryMinimum = (deliveryType, subtotal = 0) => {
  const normalizedType = normalizeDeliveryType(deliveryType)
  const minimum =
    normalizedType === "scheduled"
      ? DELIVERY_CONFIG.SCHEDULED.minOrderAmount
      : DELIVERY_CONFIG.INSTANT.minOrderAmount
  const safeSubtotal = Number(subtotal || 0)

  if (safeSubtotal < minimum) {
    return {
      valid: false,
      minimum,
      error:
        normalizedType === "scheduled"
          ? "Scheduled delivery is available for orders of Rs. 300 or more"
          : "Instant delivery is available for orders of Rs. 500 or more",
    }
  }

  return { valid: true, minimum, error: "" }
}

export const calculateTotal = ({
  subtotal = 0,
  deliveryFee = 0,
  codFee = 0,
  promoDiscount = 0,
}) => {
  return (
    Number(subtotal || 0) +
    Number(deliveryFee || 0) +
    Number(codFee || 0) -
    Number(promoDiscount || 0)
  );
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getAvailableTimeSlots = () => {
  const now = new Date();
  const currentHour = now.getHours();

  return DELIVERY_CONFIG.SCHEDULED.timeSlots.filter(
    (slot) => slot.startHour > currentHour
  );
};

export const validateDeliverySlot = (slotId) => {
  if (!slotId) {
    return { valid: false, error: "Please select a delivery slot" };
  }

  const availableSlots = getAvailableTimeSlots();
  const selectedSlot = availableSlots.find((slot) => slot.id === slotId);

  if (!selectedSlot) {
    return { valid: false, error: "Selected slot is no longer available" };
  }

  return { valid: true, error: null };
};

export const getSlotById = (slotId) => {
  return DELIVERY_CONFIG.SCHEDULED.timeSlots.find((slot) => slot.id === slotId);
};

export default {
  isNightTime,
  normalizeDeliveryType,
  validateDeliveryMinimum,
  calculateDeliveryFee,
  calculateTotal,
  formatCurrency,
  getAvailableTimeSlots,
  validateDeliverySlot,
  getSlotById,
  DELIVERY_CONFIG,
};