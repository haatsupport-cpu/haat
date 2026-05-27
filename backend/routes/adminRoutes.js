import express from "express";
import {
  getStats,
  listCustomers,
  listRecentOrders,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
const requireAdmin = [requireAuth, requireRole("admin")];

router.get("/stats", ...requireAdmin, asyncHandler(getStats));
router.get("/recent-orders", ...requireAdmin, asyncHandler(listRecentOrders));
router.get("/customers", ...requireAdmin, asyncHandler(listCustomers));

export default router;
