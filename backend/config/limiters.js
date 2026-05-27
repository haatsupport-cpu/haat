/**
 * Rate Limiting Configuration
 * Environment-aware rate limiters for different route types
 */

import rateLimit from "express-rate-limit";
import CONFIG from "./constants.js";

/**
 * Global rate limiter (for all routes)
 * Much more relaxed in development
 */
export const globalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
  max: CONFIG.RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  skip: (req) => {
    // Development: skip rate limiting for specific patterns
    if (CONFIG.isDevelopment && req.path === "/healthz") {
      return true;
    }
    return false;
  },
});

/**
 * Auth rate limiter (for login, register, etc.)
 * Stricter in production to prevent brute force
 */
export const authLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
  max: CONFIG.RATE_LIMIT.MAX_AUTH_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
  skipSuccessfulRequests: CONFIG.RATE_LIMIT.SKIP_SUCCESSFUL_REQUESTS,
  skipFailedRequests: CONFIG.RATE_LIMIT.SKIP_FAILED_REQUESTS,
});

/**
 * Checkout rate limiter (prevent accidental/malicious double-purchases)
 */
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many checkout attempts. Please wait before trying again.",
  },
});

export default { globalLimiter, authLimiter, checkoutLimiter };
