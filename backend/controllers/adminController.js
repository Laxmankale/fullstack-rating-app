import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Rating from "../models/Rating.js";
import { Op } from "sequelize";

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching dashboard stats",
        error: error.message,
      });
  }
};

// Add User (Admin can add normal/admin users)
export const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

// Add Store (Admin assigns store to a StoreOwner)
export const addStore = async (req, res) => {
  try {
    const { name, address, email, ownerId } = req.body;

    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== "store_owner") {
      return res
        .status(400)
        .json({ message: "Selected user is not a storeOwner" });
    }

    const store = await Store.create({
      name,
      address,
      email,
      ownerId,
    });

    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating store", error: error.message });
  }
};

// List Users (with filters: name, email, role)
export const listUsers = async (req, res) => {
  try {
    const { name, email, role } = req.query;
    const whereClause = {};

    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (role) whereClause.role = role;

    const users = await User.findAll({
      where: whereClause,
      attributes: ["id", "name", "email", "role"],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// List Stores (with filters: name, address)
export const listStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    const whereClause = {};

    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (address) whereClause.address = { [Op.like]: `%${address}%` };

    const stores = await Store.findAll({
      where: whereClause,
      include: [
        { model: User, as: "owner", attributes: ["id", "name", "email"] },
        { model: Rating, attributes: ["rating"] },
      ],
    });

    const storeList = stores.map((store) => {
      const ratings = store.Ratings || [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner ? store.owner.name : null,
        rating: avgRating,
      };
    });

    res.json(storeList);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stores", error: error.message });
  }
};

// User Details (if StoreOwner → include ratings)
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "role"],
      include: req.query.includeRatings === "true" && {
        model: Rating,
        attributes: ["rating"],
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    let avgRating = null;
    if (user.role === "store_owner" && user.Ratings) {
      const ratings = user.Ratings;
      avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : null;
    }

    res.json({ ...user.toJSON(), avgRating });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user details", error: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // In stateless JWT → frontend just deletes the token
    res.json({
      message:
        "Logged out successfully. Please clear the token on client side.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during logout", error: error.message });
  }
};
