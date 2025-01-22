const { Op } = require("sequelize");
const {
  Users,
  Products,
  Orders,
  Disputes,
  OrderItems,
  SystemPreferences,
} = require("../models");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const createAuditLog = require("../utils/auditLog");

const updateUserAccess = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { user_id, action } = req.query;
    if (user.id == user_id) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot update yourself" });
    }
    // Ensure action is either "activate" or "deactivate"
    if (action !== "activate" && action !== "deactivate") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }

    const findUser = await User.findOne({
      where: {
        id: user_id,
      },
    });
    const [updated, affectedRows] = await Users.update(
      { is_active: action === "activate" ? true : false },
      { where: { id: user_id }, returning: true }
    );

    // Check if the user was updated
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no change in status",
      });
    }

    await createAuditLog({
      action: `Update`,
      target_table: "Users",
      target_id: user_id,
      user_id: user.id,
      items_count: 1,
      field_name: "is_active",
      old_value: findUser?.is_active,
      new_value: findUser.is_active === 0 ? 1 : 0,
      req,
    });
    return res.status(200).json({
      success: true,
      message: `User has been ${action}d successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { user_id, role } = req.query;
    if (user.id == user_id) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot update yourself" });
    }
    // Ensure role is either "admin", "seller", or "customer"
    if (!["admin", "seller", "customer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const findUser = await Users.findOne({
      where: {
        id: user_id,
      },
    });

    // Update the user's role
    const [updated, affectedRows] = await Users.update(
      { role },
      { where: { id: user_id } }
    );

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or no change in role",
      });
    }
    await createAuditLog({
      action: `Update`,
      target_table: "Users",
      target_id: user_id,
      user_id: user.id,
      items_count: 1,
      field_name: "role",
      old_value: findUser.role,
      new_value: role,
      req,
    });

    return res.status(200).json({
      success: true,
      message: `User's role has been updated successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const prodReview = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { productId, status } = req.body;

    const product = await Products.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    await createAuditLog({
      action: `Update`,
      target_table: "Products",
      target_id: productId,
      user_id: user.id,
      items_count: 1,
      field_name: "status",
      old_value: product.status,
      new_value: status,
      req,
    });
    product.status = status;

    await product.save();
    return res.json({
      success: true,
      message: "Product Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const orderReview = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { orderId, status } = req.body;

    const order = await Orders.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    await createAuditLog({
      action: `Update`,
      target_table: "Orders",
      target_id: orderId,
      user_id: user.id,
      items_count: 1,
      field_name: "status",
      old_value: order.status,
      new_value: status,
      req,
    });
    order.status = status;
    await order.save();
    return res.json({
      success: true,
      message: "Order Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllDisputes = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const disputes = await Disputes.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Orders,
          as: "order",
          attributes: ["id", "status"],
          include: [
            {
              model: OrderItems,
              as: "order_items",
              attributes: ["id", "quantity"],
              include: [
                {
                  model: Products,
                  as: "product",
                  attributes: ["id", "name", "price"],
                },
              ],
            },
          ],
        },
      ],
    });

    return res.json({ success: true, disputes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const disputeReview = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { disputeId, resolution } = req.body;
    const dispute = await Disputes.findByPk(disputeId);
    if (!dispute) {
      return res
        .status(404)
        .json({ success: false, message: "Dispute Not Found" });
    }
    dispute.resolution = resolution;
    dispute.status = "resolved";
    await dispute.save();
    return res.json({
      success: true,
      message: "Dispute Resolved Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addPreference = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { name, value, description } = req.body;
    const checkExistence = await SystemPreferences.findOne({
      where: { name: name },
    });
    if (checkExistence) {
      const updatePreference = await SystemPreferences.update(
        {
          value: value,
          description: description,
        },
        {
          where: {
            name: name,
          },
        }
      );
      return res.json({
        success: true,
        message: "Preference updated successfully",
      });
    } else {
      const preference = await SystemPreferences.create({
        name,
        value,
        description,
      });
      return res.json({
        success: true,
        message: "Preference Added successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createAdmin = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { first_name, last_name, email, phone, password } = req.body;

    const checkExistence = await Users.findOne({
      where: {
        email: email,
        [Op.and]: phone ? { phone: phone } : {}, // Only add phone condition if it's provided
      },
    });

    if (checkExistence) {
      return res
        .status(409)
        .json({ success: false, message: "Email or Phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    const newUser = await Users.create({
      first_name,
      last_name,
      email,
      phone: phone ? phone : null,
      password: hashedPassword,
      role: "admin",
    });
    return res.json({ success: true, message: "Admin created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = {
  updateUserAccess,
  updateUserRole,
  prodReview,
  orderReview,
  getAllDisputes,
  disputeReview,
  addPreference,
  createAdmin,
};
