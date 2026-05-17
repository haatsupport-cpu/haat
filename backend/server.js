import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";

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

const app = express();

const {
  PORT = "5000",
  FRONTEND_URL = "http://localhost:5173",
  NODE_ENV = "development",
  MONGODB_URI,
  JWT_SECRET,
} = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required in environment variables");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in environment variables");
}

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (NODE_ENV !== "production" && /^(https?:\/\/localhost|https?:\/\/127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    maxAge: 86400,
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use(attachJwtSession);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: NODE_ENV === "production" ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.set("trust proxy", 1);
app.get("/healthz", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

connectDB(MONGODB_URI)
  .then(() => {
    const port = Number(PORT);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log("MongoDB configured.");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
