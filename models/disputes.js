"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Disputes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Disputes.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      order_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Orders",
          key: "id",
        },
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("open", "resolved"),
        defaultValue: "open",
        allowNull: false,
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"),
        onUpdate: Sequelize.fn("NOW"),
      },
    },
    {
      sequelize,
      modelName: "Disputes",
    }
  );
  return Disputes;
};
