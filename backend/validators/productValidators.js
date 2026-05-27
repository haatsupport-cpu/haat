export const validateCreateProduct = (req, res, next) => {
  const { name, price, category_id, category } = req.body ?? {};
  const missing = [];

  if (!name) missing.push("name");
  if (price === undefined) missing.push("price");
  if (!category_id && !category) missing.push("category_id");

  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  return next();
};

export const validateProductUpdate = (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ message: "Request body is required" });
  }
  return next();
};
