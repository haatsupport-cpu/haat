import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", requireAuth, asyncHandler(createOrder));
router.get("/", requireAuth, asyncHandler(getOrders));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(updateOrderStatus));

export default router;
