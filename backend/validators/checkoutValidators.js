export const validatePromoBody = (req, res, next) => {
  const { promoCode, subtotal } = req.body ?? {};
  if (!promoCode) {
    return res.status(400).json({ message: "promoCode is required" });
  }
  if (subtotal === undefined || Number.isNaN(Number(subtotal))) {
    return res.status(400).json({ message: "subtotal must be a number" });
  }
  return next();
};

export const validateCheckoutOrderBody = (req, res, next) => {
  const { items, customerName, customerPhone, address, lat, lng } = req.body ?? {};
  const missing = [];

  if (!Array.isArray(items) || items.length === 0) missing.push("items");
  if (!customerName) missing.push("customerName");
  if (!customerPhone) missing.push("customerPhone");
  if (!address) missing.push("address");
  if (lat === undefined) missing.push("lat");
  if (lng === undefined) missing.push("lng");

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  return next();
};
