export const validateAddToCart = (req, res, next) => {
  const { productId, quantity } = req.body ?? {};
  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }
  if (quantity !== undefined && Number(quantity) <= 0) {
    return res.status(400).json({ message: "quantity must be greater than 0" });
  }
  return next();
};

export const validateCartQuantity = (req, res, next) => {
  const { quantity } = req.body ?? {};
  if (quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({ message: "quantity must be greater than 0" });
  }
  return next();
};
