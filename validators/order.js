const { param, body } = require("express-validator");

const updateOrderStatusValidator = [
  body("status")
    .trim()
    .notEmpty()
    .isIn([
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
    ])
    .withMessage("Please select the valid status to update"),
  body("order_id").trim().notEmpty().isNumeric().withMessage("Invalid order"),
];

module.exports = {
  updateOrderStatusValidator,
};
