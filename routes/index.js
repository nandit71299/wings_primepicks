const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const productsRoutes = require("./products");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");
const dashboardRoutes = require("./dashboard");
router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);
router.use("/dashboard", dashboardRoutes);
module.exports = router;
