const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const productsRoutes = require("./products");

router.use("/auth", authRoutes);
router.use("/products", productsRoutes);

module.exports = router;
