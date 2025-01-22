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

module.exports = router;
