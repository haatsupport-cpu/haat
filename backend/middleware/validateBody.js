export const validateBody = (requiredFields = []) => (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ message: "Request body is required" });
  }

  const missing = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === "");
  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  return next();
};
