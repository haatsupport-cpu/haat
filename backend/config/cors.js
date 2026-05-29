/**
 * CORS Configuration Helper
 * Returns appropriate CORS options based on environment
 */

import CONFIG from "./constants.js";

const getDynamicAllowedOrigins = () => {
  const origins = [
    CONFIG.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    // Add Vercel production URL
    "https://haat-liart.vercel.app",
  ];

  // Add configured origins
  if (CONFIG.ALLOWED_ORIGINS.length > 0) {
    origins.push(...CONFIG.ALLOWED_ORIGINS);
  }

  // Add frontend URL if different
  if (CONFIG.FRONTEND_URL && !origins.includes(CONFIG.FRONTEND_URL)) {
    origins.push(CONFIG.FRONTEND_URL);
  }

  return [...new Set(origins)];
};

export const getCorsOptions = () => ({
  origin(origin, callback) {
    // Allow requests with no origin (same-site requests, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = getDynamicAllowedOrigins();

    // Allow if origin is in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Development: allow all localhost variants
    if (CONFIG.isDevelopment) {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    // For preflight OPTIONS requests, allow if origin is present in allowedOrigins
    // This helps with dynamic handshakes for CORS
    if (typeof origin === "string" && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Production: strict CORS
    return callback(new Error("CORS not allowed"), false);
  },
  credentials: true, // Always allow credentials for session/cookies
  methods: CONFIG.CORS_METHODS,
  allowedHeaders: CONFIG.CORS_HEADERS,
  maxAge: 3600, // 1 hour
});

export default getCorsOptions;
