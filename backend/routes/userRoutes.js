import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getCurrentUser,
  updateCurrentUser,
  listUsers,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", requireAuth, asyncHandler(getCurrentUser));
router.put("/me", requireAuth, asyncHandler(updateCurrentUser));
router.get("/", requireAuth, requireRole("admin"), asyncHandler(listUsers));
router.get("/:id", requireAuth, requireRole("admin"), asyncHandler(getUserById));

export default router;
