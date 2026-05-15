import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";

const app = express();

const {
  PORT = "5000",
  FRONTEND_URL = "http://localhost:5173",
  SUPABASE_URL,
  NODE_ENV = "development",
} = process.env;

const allowedOrigins = [
  FRONTEND_URL,
  // Helpful for local dev variants
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

// Production-safe CORS: no wildcard with credentials, handle preflight
app.use(
  cors({
    origin(origin, callback) {
      // allow REST/health checks (no origin) and same-origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    maxAge: 86400,
  })
);

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// JSON parsing
app.use(express.json({ limit: "1mb" }));

// Cookie parsing 
app.use(cookieParser());

// Rate limiting (per IP)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: NODE_ENV === "production" ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes 
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

app.get("/healthz", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);

// Centralized 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

const port = Number(PORT);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  if (SUPABASE_URL) console.log("Supabase configured.");
});
