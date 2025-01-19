"use strict";
const { Model, Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductCategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductCategories.hasMany(models.Products, {
        foreignKey: "category_id",
      });
    }
  }
  ProductCategories.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: Sequelize.fn("NOW"), // Default value
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"), // Default value
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"), // Default value
        onUpdate: Sequelize.fn("NOW"), // Update the updated_at timestamp when the record is updated.
      },
    },
    {
      sequelize,
      modelName: "ProductCategories",
    }
  );
  return ProductCategories;
};
