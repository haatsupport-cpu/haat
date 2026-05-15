import express from "express";
import {
  getCart,
  addToCart,
  updateCartItemQuantityById,
  updateCartItemQuantityByProduct,
  removeCartItem,
  removeCartItemByProduct,
} from "../controllers/cartController.js";

const router = express.Router();

// GET cart 
router.get("/", getCart);

// ✅ Add item to cart
router.post("/", addToCart);

// ✅ Update item quantity 
router.put("/:id", updateCartItemQuantityById);

// ✅ Update item quantity 
router.put("/update", updateCartItemQuantityByProduct);

// ✅ Remove item from cart 
router.delete("/:id", removeCartItem);

// ✅ Remove item from cart
router.delete("/remove/:userId/:productId", removeCartItemByProduct);

export default router;
