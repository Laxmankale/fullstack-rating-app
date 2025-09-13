import Rating from "../models/Rating.js";
import Store from "../models/Store.js";
import User from "../models/User.js";

// Normal user: submit a rating
export const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check if rating exists
    let existing = await Rating.findOne({ where: { userId, storeId } });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already rated this store" });
    }

    const newRating = await Rating.create({ userId, storeId, rating });
    res.status(201).json({ message: "Rating submitted", rating: newRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Normal user: modify rating
export const modifyRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    const existing = await Rating.findOne({ where: { userId, storeId } });
    if (!existing) return res.status(404).json({ message: "Rating not found" });

    existing.rating = rating;
    await existing.save();
    res.json({ message: "Rating updated", rating: existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Store owner: view all ratings for their store
export const getStoreRatings = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: { model: User, attributes: ["id", "name", "email"] },
    });

    res.json({ store: store.name, ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Store owner: get average rating
export const getAverageRating = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const ratings = await Rating.findAll({ where: { storeId: store.id } });
    const avg =
      ratings.reduce((acc, r) => acc + r.rating, 0) / (ratings.length || 1);

    res.json({ store: store.name, averageRating: avg.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
