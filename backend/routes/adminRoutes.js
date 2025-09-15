import express from "express";
import {
  getDashboardStats,
  listUsers,
  getUserDetails,
  listStores,
  addUser,
  addStore,
  logout,
} from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", protect, adminOnly, getDashboardStats);

// User Management
router.get("/users", protect, adminOnly, listUsers);
router.get("/users/:id", protect, adminOnly, getUserDetails);
router.post("/users/add", protect, adminOnly, addUser);

// Store Management
router.get("/stores", protect, adminOnly, listStores);
router.post("/stores/add", protect, adminOnly, addStore);

// Logout
router.post("/logout", protect, adminOnly, logout);

export default router;
