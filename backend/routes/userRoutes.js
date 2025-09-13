import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

import {
  registerUser,
  getUsers,
  loginUser,
  getProfile,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/create", protect, adminOnly, registerUser); //only existing admin can create new Admin not noram user
router.get("/", protect, adminOnly, getUsers);      // Admin-only
router.get("/profile", protect, getProfile);       // Any logged-in user
export default router;
