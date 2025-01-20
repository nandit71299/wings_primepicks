const {
  Products,
  Users,
  Orders,
  OrderItems,
  Disputes,
  Carts,
  CartItems,
  Sequelize,
} = require("../models");

const getCustomerDashboard = (req, res) => {
  try {
    const user = req.user;
  } catch (error) {}
};

const getSellerDashboard = (req, res) => {
  try {
    const user = req.user;
    // const getAllOrders = async (req, res) => {
    //   try {
    //     const user = req.user; // Logged-in user
    //     const whereConditions = {}; // Initialize where conditions

    //     if (user.role === "seller") {
    //       whereConditions["$OrderItems.Products.created_by$"] = user.id; // Filter orders where products are created by the seller

    //       // Fetch orders for the seller
    //       const orders = await Orders.findAll({
    //         where: whereConditions,
    //         include: [
    //           {
    //             model: OrderItems,
    //             include: [
    //               {
    //                 model: Products,
    //                 attributes: ["id", "name", "price", "created_by"], // Fetch relevant product attributes
    //                 required: true, // Ensures the product is part of the result
    //               },
    //             ],
    //           },
    //         ],
    //       });

    //       return res.send({ success: true, orders });
    //     }
    //     else if (user.role === "customer") {
    //       // Fetch orders for the customer
    //       const orders = await Orders.findAll({
    //         where: {
    //           user_id: user.id, // Filter by the customer's user_id
    //         },
    //         include: [
    //           {
    //             model: OrderItems,
    //             include: [
    //               {
    //                 model: Products,
    //                 attributes: ["id", "name", "price", "created_by"],
    //                 required: true,
    //                 where: {
    //                   created_by: user.id, // Ensure the product was created by the seller (if the customer is looking at their own order)
    //                 },
    //               },
    //             ],
    //           },
    //         ],
    //       });

    //       return res.send({ success: true, orders });
    //     }

    //     return res.status(400).send({ success: false, message: "Invalid role" });
    //   } catch (error) {
    //     console.error(error);
    //     return res.status(500).send({ success: false, message: "Internal server error" });
    //   }
    // };
  } catch (error) {}
};

const getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;
    let responsePayload = {};

    // Fetch products created by the logged-in user
    const products = await Products.findAll({
      where: { created_by: user.id },
    });
    responsePayload.products = products;

    // Fetch all orders, and calculate the total sum of orders in the same query
    const orders = await Orders.findAll({
      include: [
        {
          model: OrderItems,
          include: [
            {
              model: Products,
              required: true,
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "user_id",
        "status",
        "total",
        "createdAt",
        [Sequelize.fn("SUM", Sequelize.literal("Orders.total")), "total_sum"], // Sum of order totals
      ],
      group: ["Orders.id"], // Group by order ID to sum totals correctly
    });

    // Fetch disputes, separated into open (resolution is null) and closed (resolution is not null)
    const disputes = await Disputes.findAll({
      attributes: [
        [
          Sequelize.literal(
            'CASE WHEN resolution IS NULL THEN "open" ELSE "closed" END'
          ),
          "status",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: [
        Sequelize.literal(
          'CASE WHEN resolution IS NULL THEN "open" ELSE "closed" END'
        ),
      ], // Group by "open" vs "closed"
    });

    // Process disputes into open and closed arrays
    const openDisputes = disputes.find((d) => d.status == "open");
    const closedDisputes = disputes.find((d) => d.status == "closed");

    responsePayload.orders = orders;
    responsePayload.total_order_sum = orders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    ); // Calculate sum from orders
    responsePayload.disputes = {
      open: openDisputes, // Open disputes count
      closed: closedDisputes, // Closed disputes count
    };

    // Fetch all users
    const users = await Users.findAll();
    responsePayload.users = users;

    // Fetch abandoned carts with cart items and associated products
    const abandoned_carts = await Carts.findAll({
      include: [
        {
          model: CartItems,
          include: [
            {
              model: Products,
              required: true,
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });
    responsePayload.abandoned_carts = abandoned_carts;

    return res.send({ success: true, data: responsePayload });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getSellerDashboard,
  getAdminDashboard,
  getCustomerDashboard,
};
