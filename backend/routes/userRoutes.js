import express from "express";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

import {
  registerUser,
  getUsers,
  loginUser,
  getProfile,
  updatePassword,
  listStoresWithUserRating,
  searchStores,
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/create", protect, adminOnly, registerUser); 
router.get("/", protect, adminOnly, getUsers); 
router.get("/profile", protect, getProfile); 
router.put("/update-password", protect, updatePassword);
router.get("/stores", protect, listStoresWithUserRating);
router.get("/stores/search", protect, searchStores);

export default router;
