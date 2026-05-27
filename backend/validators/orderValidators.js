export const validateCreateOrder = (req, res, next) => {
  const { items } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items must contain at least one item" });
  }
  return next();
};

export const validateOrderStatusUpdate = (req, res, next) => {
  const { status, paymentStatus } = req.body ?? {};
  if (!status && !paymentStatus) {
    return res.status(400).json({ message: "status or paymentStatus is required" });
  }
  return next();
};
