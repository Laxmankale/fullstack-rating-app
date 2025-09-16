import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Name is required" },
      notEmpty: { msg: "Name cannot be empty" },
      len: {
        args: [3, 60],
        msg: "Name must be between 3 and 60 characters",
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notNull: { msg: "Email is required" },
      notEmpty: { msg: "Email cannot be empty" },
      isEmail: { msg: "Invalid email format" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "normal", "store_owner"),
    defaultValue: "normal",
  },
});
export default User;
