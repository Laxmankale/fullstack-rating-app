import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

const Store = sequelize.define("Store", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
  },
});

// Associate Store with Store Owner
Store.belongsTo(User, { as: "owner", foreignKey: "ownerId" });
User.hasMany(Store, { foreignKey: "ownerId" });

export default Store;
