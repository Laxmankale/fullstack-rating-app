import Store from "../models/Store.js";
import User from "../models/User.js";
import Rating from "../models/Rating.js";

// Admin: Add a new store
export const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== "store_owner") {
      return res
        .status(400)
        .json({ message: "Owner must be a valid store owner" });
    }

    const store = await Store.create({ name, email, address, ownerId });
    res.status(201).json({ message: "Store added successfully", store });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Get all stores
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      include: {
        model: User,
        as: "owner",
        attributes: ["id", "name", "email"],
      },
    });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStoreRaters = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.user.id;

    // Ensure the logged-in user owns this store
    const store = await Store.findOne({
      where: { id: storeId, ownerId: userId },
    });
    if (!store) {
      return res
        .status(403)
        .json({ message: "You do not own this store or it does not exist" });
    }

    // Get all ratings for this store including user info
    const ratings = await Rating.findAll({
      where: { storeId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const raters = ratings.map((r) => ({
      userId: r.User.id,
      name: r.User.name,
      email: r.User.email,
      rating: r.rating,
      comment: r.comment || null,
      ratedAt: r.createdAt,
    }));

    res.status(200).json({
      storeId,
      storeName: store.name,
      totalRaters: raters.length,
      raters,
    });
  } catch (error) {
    console.error("getStoreRaters error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

