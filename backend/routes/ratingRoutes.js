import express from "express";
import {
  submitRating,
  modifyRating,
  getStoreRatings,
  getAverageRating,
} from "../controllers/ratingController.js";
import protect, { storeOwnerOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Normal user routes
router.post("/", protect, submitRating);
router.put("/", protect, modifyRating);

// Store owner routes
router.get("/store", protect, storeOwnerOnly, getStoreRatings);
router.get("/store/average", protect, storeOwnerOnly, getAverageRating);

export default router;
