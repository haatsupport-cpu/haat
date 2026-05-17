import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", asyncHandler(getCategories));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(createCategory));
router.put("/:id", requireAuth, requireRole("admin"), asyncHandler(updateCategory));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(deleteCategory));

export default router;
