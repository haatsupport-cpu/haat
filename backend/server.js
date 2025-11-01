import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

// Routes
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/cart", cartRoutes)

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables")
    }

    // Use the connection string as-is, specify database name in options
    const mongoURI = process.env.MONGO_URI.trim()

    // Log connection info (hide credentials)
    const safeURI = mongoURI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
    console.log(`🔗 Connecting to MongoDB: ${safeURI}`)
    console.log(`📦 Using database: grocery-shop`)

    const conn = await mongoose.connect(mongoURI, {
      // Modern MongoDB driver options
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      dbName: "grocery-shop", // Explicitly specify database name
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📦 Database: ${conn.connection.name}`)

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected. Attempting to reconnect...")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected")
    })

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("MongoDB connection closed through app termination")
      process.exit(0)
    })
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`)
    console.error(
      "Make sure MongoDB is running and MONGO_URI is correct in .env file"
    )
    process.exit(1)
  }
}

// Connect to MongoDB before starting the server
connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
