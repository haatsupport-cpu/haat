/**
 * Application Constants & Configuration
 * Separates environment-aware configs for development vs production
 */

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const isDevelopment = nodeEnv === "development";

export const CONFIG = {
  // Environment
  NODE_ENV: nodeEnv,
  isProduction,
  isDevelopment,

  // Server
  PORT: Number(process.env.PORT || 5000),
  HOST: "0.0.0.0",

  // Database
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
  MONGO_OPTIONS: {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    autoIndex: false,
  },

  // Frontend/CORS
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  FRONTEND_URL: process.env.FRONTEND_URL,
  // FIXED: Safeguard fallback to prevent breaking cross-domain tools
  API_BASE_URL: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: "7d",
  SHOP_LAT: Number(process.env.SHOP_LAT || 27.429280726769314),
  SHOP_LNG: Number(process.env.SHOP_LNG || 85.03281182486674),

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: isProduction ? 100 : 10000,
    MAX_AUTH_REQUESTS: isProduction ? 20 : 10000,
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false,
  },

  // Logging
  LOG_LEVEL: isProduction ? "error" : "debug",
  LOG_FORMAT: isProduction ? "combined" : "dev",
  VERBOSE_LOGS: isDevelopment,

  // Security
  ENABLE_HELMET: isProduction,
  ENABLE_COMPRESSION: isProduction,
  TRUST_PROXY: isProduction ? true : false, // FIXED: Explicitly support cloud proxy chains

  // CORS
  CORS_CREDENTIALS: true,
  CORS_METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  CORS_HEADERS: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],

  // Cookies
  SECURE_COOKIES: isProduction,
  SAME_SITE: isProduction ? "None" : "Lax", // FIXED: "Strict" blocks cross-domain Vercel -> Render cookies
};

// Validation Runtime Guards
if (!CONFIG.JWT_SECRET) {
  throw new Error("CRITICAL STARTUP ERROR: JWT_SECRET is required in environment variables");
}

if (!CONFIG.MONGO_URI) {
  throw new Error("CRITICAL STARTUP ERROR: MONGO_URI is required in environment variables");
}

// Production Warning
if (isProduction && (!process.env.API_BASE_URL || CONFIG.API_BASE_URL.includes("localhost"))) {
  console.warn("⚠️ WARNING: API_BASE_URL is dropping back to localhost in a production environment!");
}

export default CONFIG;