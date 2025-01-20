const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const orderController = require("../controllers/order");
const authMiddleware = require("../middlewares/auth");
const { updateOrderStatusValidator } = require("../validators/order");
const handleValidationErrors = require("../middlewares/handleValidation");

// Customer
router.get("/estimate", authMiddleware, orderController.getOrderEstimate);
router.post("/", authMiddleware, orderController.createOder);
// router.get("/history");

//Seller
router.post(
  "/updateorderstatus",
  authMiddleware,
  updateOrderStatusValidator,
  handleValidationErrors,
  orderController.updateOrderStatus
);

router.get("/", authMiddleware, orderController.getAllOrders);
router.get("/:order_id", authMiddleware, orderController.getOrderInfo);

module.exports = router;
