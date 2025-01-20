const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
dotenv.config();

const {
  sequelize,
  Users,
  Products,
  Carts,
  CartItems,
  Orders,
  OrderItems,
  Sequelize,
} = require("../models");

const getOrderEstimate = async (req, res) => {
  const user = req.user;

  try {
    const findCart = await Carts.findOne({
      where: { user_id: user.id },
    });

    if (!findCart) {
      return res
        .status(404)
        .send({ success: false, message: "Cart not found" });
    }

    const findCartItems = await CartItems.findAll({
      where: { cart_id: findCart.id },
    });

    if (findCartItems.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No products found in cart" });
    }

    // Extract all the product IDs from the cart items
    const productIds = findCartItems.map((item) => item.product_id);

    // Find all products in one query
    const findProducts = await Products.findAll({
      where: { id: productIds },
    });

    const productMap = findProducts.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    let subtotal = 0;
    let tax = 0;

    for (const item of findCartItems) {
      const product = productMap[item.product_id];

      if (product) {
        subtotal += product.price * item.quantity;
        tax += product.price * item.quantity * 0.18;
      }
    }

    const total = subtotal + tax;

    return res.send({
      success: true,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const createOder = async (req, res) => {
  try {
    const user = req.user;
    const findCart = await Carts.findOne({
      where: { user_id: user.id },
    });
    if (!findCart) {
      return res
        .status(404)
        .send({ success: false, message: "Cart not found" });
    }
    const findCartItems = await CartItems.findAll({
      where: { cart_id: findCart.id },
    });
    if (findCartItems.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No products found in cart" });
    }
    const productIds = findCartItems.map((item) => item.product_id);
    const findProducts = await Products.findAll({
      where: { id: productIds },
    });
    const productMap = findProducts.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
    let subtotal = 0;
    let tax = 0;
    for (const item of findCartItems) {
      const product = productMap[item.product_id];
      if (product) {
        subtotal += product.price * item.quantity;
        tax += product.price * item.quantity * 0.18;
      }

      const newOrder = await Orders.create({
        user_id: user.id,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: (subtotal + tax).toFixed(2),
      });

      for (const item of findCartItems) {
        const product = productMap[item.product_id];
        if (product) {
          await OrderItems.create({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            subtotal: product.price * item.quantity,
            tax: product.price * item.quantity * 0.18,
            total: (
              product.price * item.quantity +
              product.price * item.quantity * 0.18
            ).toFixed(2),
          });
        }
      }
    }
    await CartItems.destroy({ where: { cart_id: findCart.id } });
    res.send({ success: true, message: "Order created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;

    // Ensure the user is a seller
    const findUser = await Users.findOne({
      where: {
        id: user.id,
        role: "seller",
      },
    });

    if (!findUser) {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }

    const { order_id, status } = req.body;

    // Find the order by ID
    const findOrder = await Orders.findOne({
      where: {
        id: order_id,
      },
    });

    if (!findOrder) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }

    // If the order status is already the same, no update is necessary
    if (findOrder.status === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${findOrder.status}`,
      });
    }

    // Update the order status
    findOrder.status = status;

    // Save the order status update within the transaction
    await findOrder.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    return res.send({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    // Rollback transaction in case of an error
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === "seller") {
      const orders = await Orders.findAll({
        include: [
          {
            model: OrderItems,
            include: [
              {
                model: Products,
                where: {
                  created_by: user.id,
                },
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });
      responseOrders = orders;
    } else if (user.role === "customer") {
      const allOrders = await Orders.findAll({
        where: {
          user_id: user.id,
        },
        include: [
          {
            model: OrderItems,
            include: [
              {
                model: Products,
                where: {
                  // Matching the 'product_id' from 'OrderItems' to 'Products.id'
                  id: Sequelize.col("OrderItems.product_id"),
                },
                attributes: ["id", "name", "price"],
              },
            ],
            attributes: ["id", "quantity"],
          },
        ],
      });
      responseOrders = allOrders;
    }
    return res.send({ success: true, orders: responseOrders });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const getOrderInfo = async (req, res) => {
  try {
    const order_id = req.params.order_id;

    const order = await Orders.findOne({
      where: {
        id: order_id,
      },
      include: [
        {
          model: OrderItems,
          attributes: ["id", "order_id", "product_id", "quantity"],
          include: [
            {
              model: Products,
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });
    return res.send({ success: true, order });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getOrderEstimate,
  createOder,
  updateOrderStatus,
  getAllOrders,
  getOrderInfo,
};
