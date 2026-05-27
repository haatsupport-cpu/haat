import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { validateCreateOrder, validateOrderStatusUpdate } from "../validators/orderValidators.js";

const router = express.Router();

router.post("/", requireAuth, validateCreateOrder, asyncHandler(createOrder));
router.get("/", requireAuth, asyncHandler(getOrders));
router.put("/:id", requireAuth, requireRole("admin"), validateOrderStatusUpdate, asyncHandler(updateOrderStatus));

export default router;
