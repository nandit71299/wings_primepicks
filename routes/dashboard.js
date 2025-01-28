const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const authMiddleware = require("../middlewares/auth");

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

// Common Seller/Admin
router.get(
  "/getAllCustomers",
  authMiddleware,
  dashboardController.getAllCustomers
);

router.get("/getAllUsers", authMiddleware, dashboardController.getAllUsers);

module.exports = router;
