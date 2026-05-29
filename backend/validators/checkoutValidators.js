export const validatePromoBody = (req, res, next) => {
  const { promoCode, subtotal, deliveryType } = req.body ?? {};
  if (!promoCode) {
    return res.status(400).json({ message: "promoCode is required" });
  }
  if (subtotal === undefined || Number.isNaN(Number(subtotal))) {
    return res.status(400).json({ message: "subtotal must be a number" });
  }
  if (deliveryType && !["instant", "scheduled", "Instant", "Scheduled"].includes(deliveryType)) {
    return res.status(400).json({ message: "deliveryType is invalid" });
  }
  return next();
};


export const validateCheckoutOrderBody = (req, res, next) => {
  const body = req.body ?? {};
  // Normalize address and coordinates (same as controller)
  const address = String(
    body.address ??
    body.deliveryAddress ??
    body.location?.address ??
    ""
  ).trim();
  const lat = Number(body.lat ?? body.location?.lat);
  const lng = Number(body.lng ?? body.location?.lng);

  const missing = [];
  if (!Array.isArray(body.items) || body.items.length === 0) missing.push("items");
  if (!body.customerName) missing.push("customerName");
  if (!body.customerPhone) missing.push("customerPhone");
  if (!address) missing.push("address");
  if (!Number.isFinite(lat)) missing.push("lat");
  if (!Number.isFinite(lng)) missing.push("lng");
  if (!body.deliveryType) missing.push("deliveryType");
  if (!body.paymentMode) missing.push("paymentMode");

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  // Validate coordinate ranges
  if (lat < -90 || lat > 90) {
    return res.status(400).json({ message: "lat must be between -90 and 90" });
  }
  if (lng < -180 || lng > 180) {
    return res.status(400).json({ message: "lng must be between -180 and 180" });
  }

  if (!["instant", "scheduled", "Instant", "Scheduled"].includes(body.deliveryType)) {
    return res.status(400).json({ message: "deliveryType is invalid" });
  }

  return next();
};
