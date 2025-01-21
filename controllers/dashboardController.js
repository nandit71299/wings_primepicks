const { where } = require("sequelize");
const {
  Products,
  Users,
  Orders,
  OrderItems,
  Disputes,
  Carts,
  CartItems,
  Sequelize,
  sequelize,
  ProductCategories,
} = require("../models");

const getCustomerDashboard = (req, res) => {
  try {
    const user = req.user;
  } catch (error) {}
};

const getSellerDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "seller") {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }

    // const orderStatuses = ["Pending", "Cancelled", "Refunded"]; // Example statuses

    const totalOrdersByStatus = await Orders.findAll({
      attributes: [
        // Count of orders for each status (pending, cancelled, refunded, etc.)
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Pending' THEN 1 ELSE NULL END"
            )
          ),
          "count_pending",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Cancelled' THEN 1 ELSE NULL END"
            )
          ),
          "count_cancelled",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Refunded' THEN 1 ELSE NULL END"
            )
          ),
          "count_refunded",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Delivered' THEN 1 ELSE NULL END"
            )
          ),
          "count_delivered",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Shipped' THEN 1 ELSE NULL END"
            )
          ),
          "count_shipped",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Processing' THEN 1 ELSE NULL END"
            )
          ),
          "count_processing",
        ],

        // Sum of total for each status (pending, cancelled, refunded, etc.)
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Pending' THEN Orders.total ELSE 0 END"
            )
          ),
          "total_pending",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Cancelled' THEN Orders.total ELSE 0 END"
            )
          ),
          "total_cancelled",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Refunded' THEN Orders.total ELSE 0 END"
            )
          ),
          "total_refunded",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Delivered' THEN Orders.total ELSE 0 END"
            )
          ),
          "total_delivered",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Shipped' THEN Orders.total ELSE 0 END"
            )
          ),
          "total_shipped",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN Orders.status = 'Processing' THEN Orders.total ELSE 0 END"
            )
          ),
          "total_processing",
        ],
      ],
      include: [
        {
          model: OrderItems,
          as: "order_items",
          attributes: [],
          include: [
            {
              model: Products,
              as: "product",
              where: { created_by: user.id }, // Filter by seller's products
              attributes: [], // Don't return product details, just aggregate
            },
          ],
          required: true, // Ensures that only orders with order_items are included
        },
      ],
    });

    const productsWithOrderCount = await Products.findAll({
      where: {
        created_by: user.id, // Filter products created by the seller
      },
      attributes: [
        "id",
        "name",
        [
          Sequelize.fn("COUNT", Sequelize.col("order_items.id")), // Count of OrderItems related to the product
          "order_count", // Alias for the count of orders
        ],
      ],
      include: [
        {
          model: OrderItems,
          as: "order_items", // Alias for the order items
          attributes: [], // Don't return any attributes from OrderItems
          include: [
            {
              model: Orders,
              as: "order", // Alias for the Orders association
              attributes: [], // Don't need any attributes from Orders here
            },
          ],
          required: true, // Ensures that only products with order items are included
        },
      ],
      group: ["Products.id"], // Group by the product ID so that we can get a count for each product
    });

    const topProducts = await Products.findAll({
      attributes: [
        "id", // Product ID
        "name", // Product Name
        [Sequelize.fn("COUNT", Sequelize.col("order_items.id")), "order_count"], // Count of order items
      ],
      include: [
        {
          model: OrderItems, // Joining OrderItems table
          as: "order_items", // Alias used for the relationship between Products and OrderItems
          attributes: [], // No specific attributes from OrderItems, we only need to count the IDs
          required: true, // Inner join to ensure we only include products that have order items
        },
      ],
      group: ["Products.id"],
    });

    res.json({
      success: true,
      totalOrdersByStatus: totalOrdersByStatus,
      productsWithOrderCount: productsWithOrderCount,
      popularProducts: topProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }

    const users = await Users.findAll({
      attributes: ["id", "first_name", "last_name", "email", "role"],
      order: [["createdAt", "DESC"]],
      where: {
        role: { [Sequelize.Op.notIn]: ["admin"] },
      },
      limit: 5,
    });

    const usersCount = await Users.findAll({
      attributes: [
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN role = 'seller' THEN 1 END")
          ),
          "total_sellers",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN role = 'customer' THEN 1 END")
          ),
          "total_customers",
        ],
      ],
      where: {
        role: {
          [Sequelize.Op.in]: ["seller", "customer"], // Filter for sellers and customers only
        },
      },
    });

    const recentPurchases = await Orders.findAll({
      limit: 5,
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: OrderItems,
          as: "order_items",
          attributes: [],
          include: [
            {
              model: Products,
              as: "product",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });
    // const popularProducts = await Products.findAll({
    //   attributes: [
    //     "id",
    //     "name",
    //     [
    //       Sequelize.fn("COUNT", Sequelize.col("OrderItems.product_id")), // Use the alias here
    //       "total_orders",
    //     ],
    //   ],
    //   include: [
    //     {
    //       model: OrderItems,
    //       as: "order_item", // Correct alias for OrderItems
    //       attributes: ["id", "product_id"],
    //       include: [
    //         {
    //           model: Orders,
    //           as: "order",
    //           attributes: ["id"],
    //         },
    //       ],
    //     },
    //   ],
    //   group: ["Products.id"],
    //   order: [[Sequelize.literal("total_orders"), "DESC"]],
    //   limit: 5,
    // });
    const [popularProducts, metaData] = await sequelize.query(`
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        COUNT(oi.product_id) AS total_orders
      FROM 
        Products p
      JOIN 
        OrderItems oi ON p.id = oi.product_id
      JOIN 
        Orders o ON oi.order_id = o.id
      GROUP BY 
        p.id
      ORDER BY 
        total_orders DESC
      LIMIT 5;
    `);

    const popularProductCategories = await ProductCategories.findAll({
      attributes: [
        "id",
        "name",
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.col("Products.order_item.order.id") // Count orders related to products in this category
          ),
          "total_orders",
        ],
      ],
      include: [
        {
          model: Products,
          attributes: [],
          include: [
            {
              model: OrderItems,
              as: "order_item",
              attributes: [],
              include: [
                {
                  model: Orders,
                  as: "order",
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
      group: ["ProductCategories.id"], // Group by ProductCategory to count orders per category
      order: [[Sequelize.literal("total_orders"), "DESC"]], // Order by the total orders in descending order
    });

    res.json({
      success: true,
      data: {
        usersCount: usersCount,
        recentUsers: users,
        recentPurchases: recentPurchases,
        popularProducts: popularProducts,
        popularProductCategories: popularProductCategories,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getSellerDashboard,
  getAdminDashboard,
  getCustomerDashboard,
};
