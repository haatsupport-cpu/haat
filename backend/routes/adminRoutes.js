import express from "express";
import {
  createPopupAd,
  createPromo,
  deletePopupAd,
  deletePromo,
  getStats,
  listPopupAds,
  listCustomers,
  listPromos,
  listRecentOrders,
  updatePopupAd,
  updatePromo,
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
const requireAdmin = [requireAuth, requireRole("admin")];

router.get("/stats", ...requireAdmin, asyncHandler(getStats));
router.get("/recent-orders", ...requireAdmin, asyncHandler(listRecentOrders));
router.get("/customers", ...requireAdmin, asyncHandler(listCustomers));
router.get("/promos", ...requireAdmin, asyncHandler(listPromos));
router.post("/promos", ...requireAdmin, asyncHandler(createPromo));
router.put("/promos/:id", ...requireAdmin, asyncHandler(updatePromo));
router.delete("/promos/:id", ...requireAdmin, asyncHandler(deletePromo));
router.get("/popup-ads", ...requireAdmin, asyncHandler(listPopupAds));
router.post("/popup-ads", ...requireAdmin, asyncHandler(createPopupAd));
router.put("/popup-ads/:id", ...requireAdmin, asyncHandler(updatePopupAd));
router.delete("/popup-ads/:id", ...requireAdmin, asyncHandler(deletePopupAd));

export default router;
