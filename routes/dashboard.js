const express = require("express");
const router = express.Router();
// const { validationResult } = require("express-validator");
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/auth");
// const {
//   addToCartValidator,
//   removeFromCartValidator,
// } = require("../validators/cart");
// const handleValidationErrors = require("../middlewares/handleValidation");

// Customer
router.get(
  "/customer",
  authMiddleware,
  dashboardController.getCustomerDashboard
);
// Seller
router.get("/seller", authMiddleware, dashboardController.getSellerDashboard);

// Admin
router.get("/admin", authMiddleware, dashboardController.getAdminDashboard);

module.exports = router;
