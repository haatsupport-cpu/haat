const validateObjectBody = (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ message: "Request body is required" });
    return false;
  }
  return true;
};

const rejectMissing = (res, fields) => {
  if (!fields.length) return false;
  res.status(400).json({ message: `Missing required fields: ${fields.join(", ")}` });
  return true;
};

export const validateRegisterBody = (req, res, next) => {
  if (!validateObjectBody(req, res)) return;

  const phoneValue = req.body.phoneno ?? req.body.phone;
  const missing = [];

  if (!req.body.name) missing.push("name");
  if (!phoneValue) missing.push("phoneno");
  if (!req.body.password) missing.push("password");
  if (req.body.acceptedPolicies !== true) {
    return res.status(400).json({ success: false, message: "You must accept Terms & Conditions and Privacy Policy" });
  }

  if (rejectMissing(res, missing)) return;
  next();
};

export const validateLoginBody = (req, res, next) => {
  if (!validateObjectBody(req, res)) return;

  const phoneValue = req.body.phoneno ?? req.body.phone;
  const missing = [];

  if (!phoneValue) missing.push("phoneno");
  if (!req.body.password) missing.push("password");

  if (rejectMissing(res, missing)) return;
  next();
};

export const validateChangePasswordBody = (req, res, next) => {
  if (!validateObjectBody(req, res)) return;

  const missing = [];
  if (!req.body.currentPassword) missing.push("currentPassword");
  if (!req.body.newPassword) missing.push("newPassword");

  if (rejectMissing(res, missing)) return;
  next();
};
