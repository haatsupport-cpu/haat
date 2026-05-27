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
    console.log("[AUTH][JWT] No token found in header.");
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.id) {
      console.log("[AUTH][JWT] Token payload missing user ID.");
      return next();
    }

    const user = await User.findById(payload.id).lean();
    if (!user) {
      console.log(`[AUTH][JWT] User with ID ${payload.id} not found.`);
      return next();
    }

    // Attach user information to the request object
    req.user = {
      id: user._id.toString(),
      phoneno: user.phoneno,
      name: user.name,
      role: user.role,
    };
    return next();
  } catch (err) {
    console.error("[AUTH][JWT] Token verification failed:", err.message);
    return next();
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Invalid token" });
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
