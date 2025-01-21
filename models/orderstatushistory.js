"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderStatusHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderStatusHistory.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      old_status: {
        type: Sequelize.ENUM(
          "Pending",
          "Cancelled",
          "Refunded",
          "Delivered",
          "Shipped",
          "Processing"
        ),
        defaultValue: "Pending",
      },
      new_status: {
        type: Sequelize.ENUM(
          "Pending",
          "Cancelled",
          "Refunded",
          "Delivered",
          "Shipped",
          "Processing"
        ),
        defaultValue: "Pending",
      },
      updated_by: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        onUpdate: Sequelize.fn("NOW"),
      },
    },
    {
      sequelize,
      modelName: "OrderStatusHistory",
    }
  );
  return OrderStatusHistory;
};
