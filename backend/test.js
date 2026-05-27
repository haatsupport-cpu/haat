import "./env.js";
import { connectDB } from "./config/db.js";

const { MONGO_URI, MONGODB_URI } = process.env;
const mongoUri = MONGO_URI || MONGODB_URI;

async function run() {
  if (!mongoUri) {
    console.error("MONGO_URI is not set in environment. Check backend/.env or environment variables.");
    process.exit(2);
  }

  try {
    await connectDB(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("Test successful: connected to MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Test failed: could not connect to MongoDB.\n", err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();