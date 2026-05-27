import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireVendorOrAdmin } from "../middleware/auth.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { validateCreateProduct, validateProductUpdate } from "../validators/productValidators.js";

const router = express.Router();

router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProductById));
router.post("/", requireAuth, requireVendorOrAdmin, validateCreateProduct, asyncHandler(createProduct));
router.put("/:id", requireAuth, requireVendorOrAdmin, validateProductUpdate, asyncHandler(updateProduct));
router.delete("/:id", requireAuth, requireVendorOrAdmin, asyncHandler(deleteProduct));

export default router;
