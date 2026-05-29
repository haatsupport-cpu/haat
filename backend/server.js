import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import CONFIG from "./config/constants.js";
import { getCorsOptions } from "./config/cors.js";

import { globalLimiter, authLimiter, checkoutLimiter } from "./config/limiters.js";
import { attachJwtSession } from "./middleware/auth.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import storageRoutes from "./routes/storageRoutes.js";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { multerErrorHandler } from "./middleware/multerErrorHandler.js";
import { uploadsDir } from "./utils/uploadConfig.js";

const app = express();

/**
 * =========================
 * TRUST PROXY (Render/Vercel)
 * =========================
 */
app.set("trust proxy", 1);

/**
 * =========================
 * SECURITY MIDDLEWARE
 * =========================
 */
if (CONFIG.ENABLE_HELMET) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
}

/**
 * =========================
 * CORS (CRITICAL FIX)
 * =========================
 */
const corsOptions = getCorsOptions();

app.use(cors(getCorsOptions()));
app.options(/.*/, cors(getCorsOptions()));

/**
 * =========================
 * CORE MIDDLEWARE
 * =========================
 */
if (CONFIG.ENABLE_COMPRESSION) {
  app.use(compression());
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(uploadsDir));

/**
 * =========================
 * LOGGING
 * =========================
 */
app.use(morgan(CONFIG.LOG_FORMAT));
app.use(requestLogger);

/**
 * =========================
 * RATE LIMITING
 * =========================
 */
app.use(globalLimiter);

/**
 * =========================
 * AUTH SESSION
 * =========================
 */
app.use(attachJwtSession);

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get("/healthz", (req, res) => {
  res.json({
    success: true,
    message: "OK",
    env: CONFIG.NODE_ENV,
  });
});

/**
 * =========================
 * DEBUG ROUTES (DEV ONLY)
 * =========================
 */
app.get("/debug/routes", (req, res) => {
  if (CONFIG.isProduction) {
    return res
      .status(403)
      .json({ success: false, message: "Not available" });
  }

  res.json({
    auth: "/api/auth",
    products: "/api/products",
    categories: "/api/categories",
    orders: "/api/orders",
    cart: "/api/cart",
    checkout: "/api/checkout",
    users: "/api/users",
    storage: "/api/storage",
    admin: "/api/admin",
  });
});

/**
 * =========================
 * API ROUTES
 * =========================
 */

// Auth (IMPORTANT: limiter applied here)
app.use("/api/auth", authLimiter, authRoutes);

// Product
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Cart
app.use("/api/cart", cartRoutes);

// Orders & Checkout
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutLimiter, checkoutRoutes);

// Users
app.use("/api/users", userRoutes);

// Storage
app.use("/api/storage", storageRoutes);

// Admin
app.use("/api/admin", adminRoutes);

/**
 * =========================
 * ERROR HANDLERS (ORDER MATTERS)
 * =========================
 */
app.use(notFoundHandler);
app.use(multerErrorHandler);
app.use(errorHandler);

/**
 * =========================
 * DB + SERVER START
 * =========================
 */
connectDB(CONFIG.MONGO_URI)
  .then(() => {
    app.listen(CONFIG.PORT, CONFIG.HOST, () => {
      console.log(`
╔════════════════════════════════════╗
   HaatOnline Backend Server
╠════════════════════════════════════╣
  ENV:   ${CONFIG.NODE_ENV}
  PORT:  ${CONFIG.PORT}
  HOST:  ${CONFIG.HOST}
  DB:    Connected ✓
╚════════════════════════════════════╝
      `);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

/**
 * =========================
 * GRACEFUL SHUTDOWN
 * =========================
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  process.exit(0);
});