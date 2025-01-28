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
  OrderStatusHistory,
  Disputes,
} = require("../models");
const Sequelize = require("sequelize");

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

    // Prepare products with quantities from the cart and calculate subtotal/tax
    const productsWithQuantity = findCartItems
      .map((item) => {
        const product = productMap[item.product_id];
        if (product) {
          const productSubtotal = product.price * item.quantity;
          subtotal += productSubtotal;
          tax += productSubtotal * 0.18;

          return {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity, // Add quantity here
            description: product.description,
            img: product.img,
          };
        }
      })
      .filter(Boolean); // Remove undefined values if any product was missing

    const total = subtotal + tax;

    return res.json({
      success: true,
      products: productsWithQuantity, // Send products with quantity
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

const createOrder = async (req, res) => {
  try {
    const user = req.user;

    // Step 1: Find the user's cart
    const findCart = await Carts.findOne({
      where: { user_id: user.id },
    });

    if (!findCart) {
      return res
        .status(404)
        .send({ success: false, message: "Cart not found" });
    }

    // Step 2: Find all items in the user's cart
    const findCartItems = await CartItems.findAll({
      where: { cart_id: findCart.id },
    });

    if (findCartItems.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "No products found in cart" });
    }

    // Step 3: Get the list of product IDs from the cart items
    const productIds = findCartItems.map((item) => item.product_id);

    // Step 4: Get product details from the database
    const findProducts = await Products.findAll({
      where: { id: productIds },
    });

    const productMap = findProducts.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    // Step 5: Check if there is enough stock for each product in the cart
    for (const item of findCartItems) {
      const product = productMap[item.product_id];
      if (product && item.quantity > product.available_quantity) {
        return res.status(400).send({
          success: false,
          message: `Not enough stock for product: ${product.name}`,
        });
      }
    }

    let subtotal = 0;
    let tax = 0;

    // Step 6: Calculate subtotal, tax, and total for the order
    for (const item of findCartItems) {
      const product = productMap[item.product_id];
      if (product) {
        subtotal += product.price * item.quantity;
        tax += product.price * item.quantity * 0.18;
      }
    }

    // Step 7: Create the order
    const newOrder = await Orders.create({
      user_id: user.id,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2),
    });

    // Step 8: Create order items for each cart item
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

        // Step 9: Deduct the product quantity after order creation
        await Products.update(
          {
            available_quantity: product.available_quantity - item.quantity,
          },
          { where: { id: product.id } }
        );
      }
    }

    // Step 10: Remove items from the cart after the order is successfully created
    await CartItems.destroy({ where: { cart_id: findCart.id } });
    setTimeout(() => {
      res.send({ success: true, message: "Order created successfully" });
    }, 2000);
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
    if (findOrder.status === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${findOrder.status}`,
      });
    }

    await OrderStatusHistory.create(
      {
        order_id,
        old_status: findOrder.status,
        updated_by: user.id,
        new_status: status,
      },
      { transaction }
    );
    findOrder.status = status;

    await findOrder.save({ transaction });

    await transaction.commit();

    return res.send({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

// TODO: REVIEW THIS BELOW API
const getAllOrders = async (req, res) => {
  try {
    const user = req.user;
    const { status, sort_by_date, user_id } = req.query;

    const whereConditions = {};

    // If the user is an admin, send all orders
    let responseOrders = [];
    if (user.role === "admin") {
      // Admin gets all orders, so no filtering based on user_id
      if (status) {
        whereConditions.status = status;
      }

      // Fetch all orders based on the conditions (if any)
      responseOrders = await Orders.findAll({
        where: whereConditions,
        include: [
          {
            model: OrderItems,
            as: "order_items",
            include: [
              {
                model: Products,
                as: "product",
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: sort_by_date ? [["createdAt", sort_by_date]] : [], // Sort by date if provided
      });
    }
    // If the user is a seller, filter orders by products created by the seller
    else if (user.role === "seller") {
      whereConditions["$order_items.product.created_by$"] = user.id;

      // Add status filter if provided
      if (status) {
        whereConditions.status = status;
      }

      // Fetch orders based on the conditions
      responseOrders = await Orders.findAll({
        where: whereConditions,
        include: [
          {
            model: OrderItems,
            as: "order_items",
            include: [
              {
                model: Products,
                as: "product",
                where: {
                  created_by: user.id,
                },
                attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
        order: sort_by_date ? [["createdAt", sort_by_date]] : [], // Sort by date if provided
      });
    }
    // If the user is a customer, filter orders by the user's ID
    else if (user.role === "customer") {
      whereConditions.user_id = user.id; // Filter by the logged-in customer

      // Add status filter if provided
      if (status) {
        whereConditions.status = status;
      }

      // Fetch orders based on the conditions
      responseOrders = await Orders.findAll({
        where: whereConditions,
        include: [
          {
            model: OrderItems,
            as: "order_items",

            include: [
              {
                model: Products,
                as: "product",
                where: {
                  // Matching the 'product_id' from 'OrderItems' to 'Products.id'
                  id: Sequelize.col("order_items.product_id"),
                },
                attributes: ["id", "name", "price"],
              },
            ],
            attributes: ["id", "quantity"],
          },
        ],
        order: sort_by_date ? [["createdAt", sort_by_date]] : [], // Sort by date if provided
      });
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
    const {
      user,
      params: { order_id },
    } = req;

    const whereConditions = { id: order_id };

    if (user.role === "seller") {
      whereConditions["$OrderItems.Product.created_by$"] = {
        [Op.eq]: user.id,
      };
    } else if (user.role === "customer") {
      whereConditions.user_id = user.id;
    }

    const order = await Orders.findOne({
      where: whereConditions,
      include: [
        {
          model: OrderItems,
          attributes: ["id", "order_id", "product_id", "quantity"],
          include: [
            {
              model: Products,
              attributes: ["id", "name", "price"],
              required: user.role === "seller",
            },
          ],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }

    return res.send({ success: true, order });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

const raiseADispute = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "customer") {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }
    const { order_id, issue } = req.body;
    const findOrder = await Orders.findOne({ where: { id: order_id } });
    if (!findOrder) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }
    await Disputes.create({
      order_id,
      user_id: user.id,
      reason: issue,
      status: "open",
    });
    return res.send({ success: true, message: "Dispute raised successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getOrderEstimate,
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderInfo,
  raiseADispute,
};
