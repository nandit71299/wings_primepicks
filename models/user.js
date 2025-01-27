"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"), // Default value
        allowNull: false, // NOT NULL constraint
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"), // Default value
        allowNull: false, // NOT NULL constraint
        onUpdate: Sequelize.fn("NOW"), // Update the updated_at timestamp when the record is updated.
      },
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
