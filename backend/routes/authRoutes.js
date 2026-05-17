import express from "express";
import { validateBody } from "../middleware/validateBody.js";
import { requireAuth } from "../middleware/auth.js";
import {
  registerUser,
  loginUser,
  googleAuthUser,
  getCurrentUser,
  logoutUser,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/register", validateBody(["name", "email", "password"]), registerUser);
router.post("/login", validateBody(["email", "password"]), loginUser);
router.post("/google", validateBody(["accessToken"]), googleAuthUser);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
