import User from "../models/User.js";
import Store from "../models/Store.js";
import Rating from "../models/Rating.js";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide email and password" });

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // Try bcrypt compare (if password hashed). Fallback to plain-text comparison for dev/migration only.
    const isMatch = await bcrypt
      .compare(password, user.password)
      .catch(() => false);
    const valid = isMatch || password === user.password;

    if (!valid)
      return res.status(401).json({ message: "Invalid email or password" });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Normal registration (self signup)
    if (!role || role === "normal") {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "normal",
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }

    // Admin or Store Owner creation → Only existing admin can create
    if (role === "admin" || role === "store_owner") {
      // req.user must exist and be admin
      if (!req.user || req.user.role !== "admin") {
        return res
          .status(403)
          .json({
            message: "Only admins can create admin or store owner users",
          });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Logged-in User Profile
export const getProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    if (!req.user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Old password incorrect" });

    // hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  List all stores (with user's own rating if exists)
export const listStoresWithUserRating = async (req, res) => {
  try {
    const userId = req.user.id;

    const stores = await Store.findAll({
      include: [
        {
          model: Rating,
          attributes: ["rating"],
          where: { userId },
          required: false, // include even if user hasn't rated
        },
      ],
    });

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Search stores by name & address
export const searchStores = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const stores = await Store.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { address: { [Op.like]: `%${query}%` } },
        ],
      },
    });

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};