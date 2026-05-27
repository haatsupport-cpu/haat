import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createUploadUrl,
  uploadMultipleImages,
  uploadSingleImage,
} from "../controllers/storageController.js";
import upload from "../utils/uploadConfig.js";

const router = express.Router();

router.post("/upload-url", requireAuth, asyncHandler(createUploadUrl));
router.post(
  "/upload",
  requireAuth,
  upload.single("image"),
  asyncHandler(uploadSingleImage)
);
router.post(
  "/uploads",
  requireAuth,
  upload.array("images", 5),
  asyncHandler(uploadMultipleImages)
);

export default router;
