const { param } = require("express-validator");

const addToCartValidator = [
  param("sellerId")
    .trim()
    .isNumeric()
    .withMessage("Seller ID must be a number"),
  param("productId")
    .trim()
    .isNumeric()
    .withMessage("Product ID must be a number"),
];

const removeFromCartValidator = [
  param("productId")
    .trim()
    .isNumeric()
    .withMessage("Product ID must be a number"),
];

module.exports = {
  addToCartValidator,
  removeFromCartValidator,
};
