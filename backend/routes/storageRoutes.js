import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { createUploadUrl } from "../controllers/storageController.js";

const router = express.Router();

router.post("/upload-url", requireAuth, asyncHandler(createUploadUrl));

export default router;
