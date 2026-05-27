import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getCart,
  addToCart,
  updateCartItemQuantityById,
  updateCartItemQuantityByProduct,
  removeCartItem,
  removeCartItemByProduct,
} from "../controllers/cartController.js";
import { validateAddToCart, validateCartQuantity } from "../validators/cartValidators.js";

const router = express.Router();

router.get("/", requireAuth, asyncHandler(getCart));
router.post("/", requireAuth, validateAddToCart, asyncHandler(addToCart));
router.put("/update", requireAuth, validateAddToCart, validateCartQuantity, asyncHandler(updateCartItemQuantityByProduct));
router.put("/:id", requireAuth, validateCartQuantity, asyncHandler(updateCartItemQuantityById));
router.delete("/remove/:userId/:productId", requireAuth, asyncHandler(removeCartItemByProduct));
router.delete("/:id", requireAuth, asyncHandler(removeCartItem));

export default router;
