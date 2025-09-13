import Store from "../models/Store.js";
import User from "../models/User.js";

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
