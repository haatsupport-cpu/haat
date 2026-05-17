import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireVendorOrAdmin } from "../middleware/auth.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", asyncHandler(getProducts));
router.post("/", requireAuth, requireVendorOrAdmin, asyncHandler(createProduct));
router.put("/:id", requireAuth, requireVendorOrAdmin, asyncHandler(updateProduct));
router.delete("/:id", requireAuth, requireVendorOrAdmin, asyncHandler(deleteProduct));

export default router;
