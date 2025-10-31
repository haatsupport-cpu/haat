import express from "express"
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js"

const router = express.Router()

// POST create order
router.post("/", createOrder)

// GET all orders
router.get("/", getOrders)

// PUT update order status
router.put("/:id", updateOrderStatus)

export default router
