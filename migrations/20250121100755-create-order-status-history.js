"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderStatusHistories", {
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OrderStatusHistories");
  },
};
