const dotenv = require("dotenv");
dotenv.config();
const { Op } = require("sequelize");

const {
  sequelize,
  Users,
  Products,
  ProductCategories,
  AuditLogs,
  AuditLogItems,
  SystemPreferences,
} = require("../models");

const createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, category, description, price, available_quantity } = req.body;

    const user = await Users.findOne({
      where: {
        email: req.user.email,
        role: "seller",
      },
    });

    if (!user) {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }
    const categoryId = await ProductCategories.findOne({
      where: { id: category },
    });
    if (!categoryId) {
      return res
        .status(404)
        .send({ success: false, message: "Category not found" });
    }
    const checkPreferences = await SystemPreferences.findOne({
      where: { name: "max_price" },
    });
    if (checkPreferences) {
      const maxPrice = parseFloat(checkPreferences.value);
      if (price > maxPrice) {
        return res.status(400).send({
          success: false,
          message: `Price must not exceed ${maxPrice}`,
        });
      }
    }
    const product = await Products.create(
      {
        name,
        category_id: Number(category),
        description,
        price: parseFloat(price).toFixed(2),
        available_quantity: Number(available_quantity),
        created_by: user.id,
      },
      { transaction }
    );
    transaction.commit();
    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    await transaction.rollback();
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getStoreProduct = async (req, res) => {
  try {
    const { sellerId, productId } = req.params;
    const user = await Users.findOne({
      where: {
        id: Number(sellerId),
        role: "seller",
      },
    });
    if (!user) {
      return res
        .status(403)
        .send({ success: false, message: "No Store Found" });
    }
    const product = await Products.findOne({
      where: {
        id: Number(productId),
        created_by: user.id,
        isDeleted: false,
        isActive: true,
      },
    });
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }
    res.status(200).send({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getAllStoreProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const user = await Users.findOne({
      where: {
        id: Number(sellerId),
        role: "seller",
      },
    });
    if (!user) {
      return res
        .status(403)
        .send({ success: false, message: "No Store Found" });
    }
    const products = await Products.findAll({
      where: {
        created_by: user.id,
        isDeleted: false,
        isActive: true,
      },
    });
    res.status(200).send({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, price_min, price_max, name } = req.query; // Get query parameters

    // Start with the base conditions: active and not deleted
    const whereConditions = {
      isDeleted: false,
      isActive: true,
    };

    // Add category filter if provided
    if (category) {
      whereConditions.category_id = category; // Assuming category is stored as category_id
    }

    // Add price range filter if provided
    if (price_min && price_max) {
      // If both min and max prices are provided, use Op.between
      whereConditions.price = { [Op.between]: [price_min, price_max] };
    } else if (price_min) {
      // If only min price is provided, filter products greater than or equal to price_min
      whereConditions.price = { [Op.gte]: price_min };
    } else if (price_max) {
      // If only max price is provided, filter products less than or equal to price_max
      whereConditions.price = { [Op.lte]: price_max };
    }

    // Add name search filter if provided
    if (name) {
      whereConditions.name = { [Op.like]: `%${name}%` }; // Search for products by name using LIKE
    }

    // Fetch the products with the applied filters
    const products = await Products.findAll({
      where: whereConditions,
      limit: 20, // Optionally, limit to a certain number of products per request
      offset: 0, // Adjust for pagination if needed
    });

    return res.status(200).send({ success: true, products });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { productId } = req.params;
    const { name, category, description, price, available_quantity } = req.body;

    const findUser = await Users.findOne({
      where: {
        id: user.id,
        role: "seller",
      },
    });

    if (!findUser) {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }

    const product = await Products.findOne({
      where: {
        id: Number(productId),
        created_by: user.id,
        isDeleted: false,
        isActive: true,
      },
    });
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }

    // Save old values to compare with new ones
    const oldValues = {
      name: product.name,
      category_id: Number(product.category_id),
      description: product.description,
      price: parseFloat(product.price).toFixed(2), // Ensure the price is a string with two decimal places
      available_quantity: product.available_quantity,
    };

    let updatePayload = {};

    if (name) updatePayload.name = name;
    if (category) updatePayload.category_id = Number(category);
    if (description) updatePayload.description = description;
    if (price) updatePayload.price = price;
    if (available_quantity)
      updatePayload.available_quantity = available_quantity;

    await product.update(updatePayload, { transaction });

    // Create the audit log entry
    const auditLog = await AuditLogs.create(
      {
        user_id: user.id,
        action: "update",
        description: `Updated product with id: ${productId}`,
        target_table: "Products",
        target_id: productId,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
        items_count: Object.keys(updatePayload).length, // count of updated fields
      },
      { transaction }
    );

    // Loop over the fields and create audit log items for each updated field
    const auditLogItems = [];

    for (let field in updatePayload) {
      let oldValue = oldValues[field]; // Original value before update
      let newValue = updatePayload[field]; // New value after update

      // Normalize and compare prices
      if (field === "price") {
        oldValue = parseFloat(oldValue).toFixed(2); // Price should always have two decimals
        newValue = parseFloat(newValue).toFixed(2); // Ensure new price has two decimals
      }

      // Do not fix decimals for available_quantity or other numeric fields
      if (field !== "price") {
        oldValue = oldValue.toString(); // Ensure string comparison
        newValue = newValue.toString(); // Ensure string comparison
      }

      // Only log changes if the value is actually different
      if (oldValue !== newValue) {
        auditLogItems.push({
          audit_log_id: auditLog.id,
          field_name: field,
          old_value: oldValue,
          new_value: newValue,
          action: "update",
        });
      }
    }

    // Bulk create audit log items
    if (auditLogItems.length > 0) {
      await AuditLogItems.bulkCreate(auditLogItems, { transaction });
    }

    // Commit the transaction
    await transaction.commit();

    return res.status(200).send({
      success: true,
      message: "Product updated successfully",
      data: updatePayload,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;
    const { productId } = req.params;
    const findUser = await Users.findOne({
      where: {
        id: user.id,
        role: "seller",
      },
    });
    if (!findUser) {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }
    const product = await Products.findOne({
      where: {
        id: productId,
        created_by: findUser.id,
        isDeleted: false,
        isActive: true,
      },
    });
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }
    const deletedProduct = await product.update({
      isDeleted: true,
      isActive: false,
    });
    const auditLog = await AuditLogs.create({
      user_id: user.id,
      action: "delete",
      description: `Deleted product with id: ${productId}`,
      target_table: "Products",
      target_id: productId,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });
    await AuditLogItems.create({
      audit_log_id: auditLog.id,
      field_name: "isDeleted",
      old_value: false,
      new_value: true,
      action: "delete",
    });
    transaction.commit();
    res
      .status(200)
      .send({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createProduct,
  getStoreProduct,
  getAllStoreProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
