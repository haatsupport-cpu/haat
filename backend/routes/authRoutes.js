import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateProfile,
  updatePassword,
} from "../controllers/authController.js";
import {
  validateChangePasswordBody,
  validateLoginBody,
  validateRegisterBody,
} from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", validateRegisterBody, asyncHandler(registerUser));
router.post("/login", validateLoginBody, asyncHandler(loginUser));

router.get("/me", requireAuth, asyncHandler(getCurrentUser));
router.post("/logout", asyncHandler(logoutUser));
router.put("/me", requireAuth, asyncHandler(updateProfile));
router.put("/change-password", requireAuth, validateChangePasswordBody, asyncHandler(updatePassword));

export default router;
