import mongoose from "mongoose";

const mongooseOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  autoIndex: false,
};

// =========================
// MongoDB Event Listeners
// =========================

mongoose.connection.on("connected", () => {
  console.log("-----------------------------------------");
  console.log("✅ MongoDB connected successfully");
  console.log("-----------------------------------------");
});

mongoose.connection.on("error", (err) => {
  console.error("-----------------------------------------");
  console.error("❌ MongoDB connection error:");
  console.error(err?.message || err);
  console.error("-----------------------------------------");
});

mongoose.connection.on("disconnected", () => {
  console.warn("-----------------------------------------");
  console.warn("⚠ MongoDB disconnected");
  console.warn("-----------------------------------------");
});

// =========================
// Graceful Shutdown
// =========================

const shutdownHandler = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();

      console.log("-----------------------------------------");
      console.log("✅ MongoDB disconnected cleanly");
      console.log("-----------------------------------------");
    }
  } catch (err) {
    console.error("❌ Error during shutdown:", err?.message || err);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdownHandler("SIGINT"));
process.on("SIGTERM", () => shutdownHandler("SIGTERM"));

// =========================
// Unhandled Errors
// =========================

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

// =========================
// Connect Database
// =========================

export const connectDB = async (uri) => {
  try {
    const mongoUri = uri || process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("Missing MONGO_URI in environment");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri, mongooseOptions);

    return mongoose.connection;
  } catch (error) {
    console.error("-----------------------------------------");
    console.error("❌ FATAL: Failed to connect to MongoDB");
    console.error(error?.message || error);
    console.error("-----------------------------------------");

    process.exit(1);
  }
};

export default connectDB;
