import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const getTokenFromHeader = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
};

export const attachJwtSession = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  req.authToken = token;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.id) {
      return next();
    }

    const user = await User.findById(payload.id).lean();
    if (!user) {
      return next();
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return next();
  } catch {
    return next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return next();
};

export const requireVendorOrAdmin = requireRole("vendor", "admin");
