const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const productsRoutes = require("./products");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const adminRoutes = require("./admin");
const dashboardRoutes = require("./dashboard");

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
