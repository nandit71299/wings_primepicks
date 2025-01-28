const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const cartController = require("../controllers/cart");
const authMiddleware = require("../middlewares/auth");
const {
  addToCartValidator,
  removeFromCartValidator,
} = require("../validators/cart");
const handleValidationErrors = require("../middlewares/handleValidation");

//Customer
router.post(
  "/:productId/",
  authMiddleware,
  addToCartValidator,
  handleValidationErrors,
  cartController.addToCart
);
router.delete(
  "/:productId/",
  authMiddleware,
  removeFromCartValidator,
  handleValidationErrors,
  cartController.removeFromCart
);
router.get("/", authMiddleware, cartController.getCartItems);

module.exports = router;
