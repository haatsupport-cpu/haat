import express from "express"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"

const router = express.Router()

// Admin Dashboard Stats
router.get("/stats", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const orderCount = await Order.countDocuments()
    const productCount = await Product.countDocuments()
    const customerCount = await User.countDocuments({ role: "customer" })

    res.json({
      totalSales: totalSales[0]?.total || 0,
      orderCount,
      productCount,
      customerCount,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
})

// Recent Orders
router.get("/recent-orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("userId", "name email")

    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" })
  }
})

// Get all customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 })
    res.json(customers)
  } catch (err) {
    res.status(500).json({ message: "Error fetching customers" })
  }
})

export default router
