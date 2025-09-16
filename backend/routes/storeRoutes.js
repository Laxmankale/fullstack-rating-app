import express from "express";
import {
  addStore,
  getAllStores,
  getStoreRaters,
} from "../controllers/storeController.js";
import protect, { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin only routes
router.post("/", protect, adminOnly, addStore);
router.get("/", protect, adminOnly, getAllStores);
router.get("/:storeId/raters", protect, getStoreRaters);

export default router;
