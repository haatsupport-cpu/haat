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

const router = express.Router();

router.get("/", requireAuth, asyncHandler(getCart));
router.post("/", requireAuth, asyncHandler(addToCart));
router.put("/:id", requireAuth, asyncHandler(updateCartItemQuantityById));
router.put("/update", requireAuth, asyncHandler(updateCartItemQuantityByProduct));
router.delete("/:id", requireAuth, asyncHandler(removeCartItem));
router.delete("/remove/:userId/:productId", requireAuth, asyncHandler(removeCartItemByProduct));

export default router;
