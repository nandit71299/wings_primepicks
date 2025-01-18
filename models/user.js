"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false, // NOT NULL constraint
        unique: true, // Unique constraint
      },
      phone: { type: DataTypes.STRING, unique: true, allowNull: true },
      password: {
        type: DataTypes.STRING,
        allowNull: false, // NOT NULL constraint
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false, // NOT NULL constraint
        defaultValue: true, // Default value
      },
      role: {
        type: DataTypes.ENUM("customer", "seller", "admin"),
        allowNull: false,
        defaultValue: "customer",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
