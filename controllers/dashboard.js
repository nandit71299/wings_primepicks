const { where } = require("sequelize");
const {
  Products,
  Users,
  Orders,
  OrderItems,
  sequelize,
  ProductCategories,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { parse } = require("json2csv");

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

    const totalOrdersByStatus = await Orders.findAll({
      attributes: [
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

    // Check for the generatecsv flag
    const { generatecsv } = req.query; // Assume the flag comes as a query parameter

    // Fetch dashboard data
    const users = await Users.findAll({
      attributes: ["id", "first_name", "last_name", "email", "role"],
      order: [["createdAt", "DESC"]],
      where: {
        role: { [Op.notIn]: ["admin"] },
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
          [Sequelize.Op.in]: ["seller", "customer"],
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
          Sequelize.fn("COUNT", Sequelize.col("Products.order_items.order.id")),
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
              as: "order_items",
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
      group: ["ProductCategories.id"],
      order: [[Sequelize.literal("total_orders"), "DESC"]],
    });

    if (generatecsv === "true") {
      const filePath = path.join(__dirname, "admin_dashboard.csv");

      // Generate CSV data for multiple sections

      // User Info section
      const userInfoData = users.map((user) => ({
        user_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      }));

      // User Count section
      const userCountData = [
        {
          total_sellers: usersCount?.[0]?.dataValues?.total_sellers,
          total_customers: usersCount?.[0]?.dataValues?.total_customers,
        },
      ];

      // Recent Purchases section
      const recentPurchasesData = recentPurchases.map((purchase) => ({
        order_id: purchase.id,
        user_name: `${purchase.user.first_name} ${purchase.user.last_name}`,
        order_date: purchase.createdAt,
        total_amount: purchase.total,
        product_names: purchase.order_items
          .map((item) => item.product.name)
          .join(", "),
      }));

      // Popular Products section
      const popularProductsData = popularProducts.map((product) => ({
        product_id: product.product_id,
        product_name: product.product_name,
        total_orders: product.total_orders,
      }));

      // Popular Product Categories section
      const popularProductCategoriesData = popularProductCategories.map(
        (category) => ({
          category_id: category.id,
          category_name: category.name,
          total_orders: category.total_orders,
        })
      );

      // Helper function to write data to CSV
      const writeCsv = (data, headers, append = false) => {
        const csv = parse(data, { fields: headers });
        const writeMode = append ? "a" : "w";
        fs.writeFileSync(filePath, csv, { flag: writeMode });
      };

      // Write an empty row before the User Info section
      fs.appendFileSync(filePath, "\n");

      // Write User Info CSV with header
      const userHeaders = [
        "user_id",
        "first_name",
        "last_name",
        "email",
        "role",
      ];
      writeCsv(userInfoData, userHeaders);

      // Append empty row for separation
      fs.appendFileSync(filePath, "\n");

      // Write an empty row before the User Count section
      fs.appendFileSync(filePath, "\n");

      // Write User Count CSV with header
      const userCountHeaders = ["total_sellers", "total_customers"];
      writeCsv(userCountData, userCountHeaders, true);

      // Append empty row for separation
      fs.appendFileSync(filePath, "\n");

      // Write an empty row before the Recent Purchases section
      fs.appendFileSync(filePath, "\n");

      // Write Recent Purchases CSV with header
      const recentPurchasesHeaders = [
        "order_id",
        "user_name",
        "order_date",
        "total_amount",
      ];

      writeCsv(recentPurchasesData, recentPurchasesHeaders, true);

      // Append empty row for separation
      fs.appendFileSync(filePath, "\n");

      // Write an empty row before the Popular Products section
      fs.appendFileSync(filePath, "\n");

      // Write Popular Products CSV with header
      const popularProductsHeaders = [
        "product_id",
        "product_name",
        "total_orders",
      ];
      writeCsv(popularProductsData, popularProductsHeaders, true);

      // Append empty row for separation
      fs.appendFileSync(filePath, "\n");

      // Write an empty row before the Popular Product Categories section
      fs.appendFileSync(filePath, "\n");

      // Write Popular Product Categories CSV with header
      const popularProductCategoriesHeaders = [
        "category_id",
        "category_name",
        "total_orders",
      ];
      writeCsv(
        popularProductCategoriesData,
        popularProductCategoriesHeaders,
        true
      );

      // Send the CSV file as a response to the user
      res.download(filePath, "admin_dashboard.csv", (err) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .send({ success: false, message: "Error sending CSV file" });
        } else {
          // Optionally remove the file after sending
          fs.unlinkSync(filePath);
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          usersCount,
          recentUsers: users,
          recentPurchases,
          popularProducts,
          popularProductCategories,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "admin") {
      const customers = await Users.findAll({
        attributes: ["id", "first_name", "last_name", "email", "is_active"],
        order: [["createdAt", "DESC"]],
        where: {
          role: "customer",
        },
      });
      return res.json({ success: true, data: customers });
    } else if (user.role === "seller") {
      const customers = await Orders.findAll({
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["id", "first_name", "last_name", "email", "is_active"],
          },
          {
            model: OrderItems,
            as: "order_items",
            include: [
              {
                model: Products,
                as: "product",
                // attributes: ["id", "name", "price"],
              },
            ],
          },
        ],
      });

      return res.json({ success: true, data: customers });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "admin") {
      return res.status(403).send({ success: false, message: "Unauthorized" });
    }
    const users = await Users.findAll({
      attributes: ["id", "first_name", "last_name", "email", "role"],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getSellerDashboard,
  getAdminDashboard,
  getCustomerDashboard,
  getAllUsers,
  getAllCustomers,
};
