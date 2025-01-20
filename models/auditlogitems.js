"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AuditLogItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AuditLogItems.belongsTo(models.AuditLogs, {
        foreignKey: "audit_log_id",
      });
    }
  }
  AuditLogItems.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      audit_log_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "AuditLogs",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      field_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      old_value: {
        type: Sequelize.TEXT,
      },
      new_value: {
        type: Sequelize.TEXT,
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
      modelName: "AuditLogItems",
    }
  );
  return AuditLogItems;
};
