import User from "../models/User.js";
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
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

