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

// ============================================
// MIDDLEWARE SETUP (Order matters!)
// ============================================

// Trust proxy (for deployment)
if (CONFIG.TRUST_PROXY) {
  app.set("trust proxy", CONFIG.TRUST_PROXY);
}

// Security headers (production only)
if (CONFIG.ENABLE_HELMET) {
  app.use(
    helmet({
      contentSecurityPolicy: false, // Adjust if needed for your frontend
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
}

// CORS
app.use(cors(getCorsOptions()));

// Compression
if (CONFIG.ENABLE_COMPRESSION) {
  app.use(compression());
}

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

// Logging
app.use(morgan(CONFIG.LOG_FORMAT));
app.use(requestLogger);

// Rate limiting (global first, specific routes can override)
app.use(globalLimiter);

// JWT Session attachment (non-blocking)
app.use(attachJwtSession);


// ============================================
// HEALTH & DEBUG ENDPOINTS
// ============================================

app.get("/healthz", (req, res) => {
  res.json({ success: true, message: "OK", env: CONFIG.NODE_ENV });
});

app.get("/debug/routes", (req, res) => {
  if (CONFIG.isProduction) {
    return res.status(403).json({ success: false, message: "Not available in production" });
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

// ============================================
// API ROUTES
// ============================================

// Auth routes (with stricter rate limiting)
app.use("/api/auth", authLimiter, authRoutes);

// Product routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Cart routes
app.use("/api/cart", cartRoutes);

// Order & checkout routes (checkout has additional rate limiting)
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutLimiter, checkoutRoutes);

// User routes
app.use("/api/users", userRoutes);

// Storage routes
app.use("/api/storage", storageRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler (must be after all route handlers)
app.use(notFoundHandler);

// Multer upload errors
app.use(multerErrorHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

connectDB(CONFIG.MONGO_URI)
  .then(() => {
    app.listen(CONFIG.PORT, CONFIG.HOST, () => {
      console.log(`

        HaatOnline Backend Server                
╠════════════════════════════════════════════╣
  Environment: ${CONFIG.NODE_ENV.toUpperCase().padEnd(34)}
  Port:        ${String(CONFIG.PORT).padEnd(34)}
  URL:         http://${CONFIG.HOST}:${CONFIG.PORT}${" ".repeat(22)}
  MongoDB:     Connected ✓${" ".repeat(25)}

      `);
    });
  })
  .catch((err) => {
    console.error(
      "\n❌ FATAL: Failed to connect to MongoDB\n",
      err?.message || err
    );
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received. Shutting down gracefully...");
  process.exit(0);
});

