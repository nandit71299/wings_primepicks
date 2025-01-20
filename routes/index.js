const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const productsRoutes = require("./products");
const cartRoutes = require("./cart");
const orderRoutes = require("./order");

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/order", orderRoutes);

module.exports = router;
