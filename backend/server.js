import express from "express";
import dotenv from "dotenv";
import { connectDB, sequelize } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// DB Connection
connectDB();

// Sync Models
sequelize.sync().then(() => {
  console.log("✅ Database & tables created!");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
