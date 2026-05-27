// frontend/src/utils/checkoutCalculator.js
export const DELIVERY_CONFIG = {
  SCHEDULED: {
    timeSlots: [
      {
        id: "morning",
        label: "Morning",
        startHour: 9,
      },
      {
        id: "afternoon",
        label: "Afternoon",
        startHour: 13,
      },
      {
        id: "evening",
        label: "Evening",
        startHour: 17,
      },
    ],
  },
}

export const isNightTime = () => {
  const hour = new Date().getHours()

  return hour >= 20 || hour < 6
}

export const calculateDeliveryFee = (
  subtotal = 0
) => {
  if (subtotal >= 1000) return 0

  return 100
}

export const calculateTotal = ({
  subtotal = 0,
  deliveryFee = 0,
  codFee = 0,
  
}) => {
  return (
    Number(subtotal || 0) +
    Number(deliveryFee || 0) +
    Number(codFee || 0) 
  );
};
/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Return available same-day slots only
 */
export const getAvailableTimeSlots = () => {
  const now = new Date();
  const currentHour = now.getHours();

  return DELIVERY_CONFIG.SCHEDULED.timeSlots.filter(
    (slot) => slot.startHour > currentHour
  );
};

/**
 * Validate slot selection
 */
export const validateDeliverySlot = (slotId) => {
  if (!slotId) {
    return {
      valid: false,
      error: "Please select a delivery slot",
    };
  }

  const availableSlots = getAvailableTimeSlots();

  const selectedSlot = availableSlots.find(
    (slot) => slot.id === slotId
  );

  if (!selectedSlot) {
    return {
      valid: false,
      error: "Selected slot is no longer available",
    };
  }

  return {
    valid: true,
    error: null,
  };
};

/**
 * Get slot details by ID
 */
export const getSlotById = (slotId) => {
  return DELIVERY_CONFIG.SCHEDULED.timeSlots.find(
    (slot) => slot.id === slotId
  );
};

export default {
  isNightTime,
  calculateDeliveryFee,
  calculateTotal,
  formatCurrency,
  getAvailableTimeSlots,
  validateDeliverySlot,
  getSlotById,
  DELIVERY_CONFIG,
};