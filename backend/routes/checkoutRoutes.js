// backend/routes/checkoutRoutes.js
// Checkout API endpoints: pricing, validation, promo codes, order creation

import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import * as checkoutController from "../controllers/checkoutController.js";

const router = express.Router();

// Get delivery pricing configuration
router.get("/pricing", asyncHandler(checkoutController.getPricingConfig));

// Validate promo code
router.post("/validate-promo", asyncHandler(checkoutController.validatePromo));

// Calculate order total with all charges
router.post("/calculate-total", asyncHandler(checkoutController.calculateOrderTotal));

// Save delivery address
router.post("/address", requireAuth, asyncHandler(checkoutController.saveDeliveryAddress));

// Get user's saved delivery addresses
router.get("/addresses", requireAuth, asyncHandler(checkoutController.getUserDeliveryAddresses));

// Create order (complete checkout)
router.post("/create-order", requireAuth, asyncHandler(checkoutController.createCheckoutOrder));

export default router;
