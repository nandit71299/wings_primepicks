const { query, body } = require("express-validator");

const updateUserAccessValidator = [
  query("user_id").trim().isNumeric().withMessage("User ID must be a number"),
  query("action")
    .trim()
    .isIn(["activate", "deactivate"])
    .withMessage("Please select the valid action"),
];

const changeUserRoleValidator = [
  query("user_id").trim().isNumeric().withMessage("User ID must be a number"),
  query("role")
    .trim()
    .isIn(["admin", "seller", "customer"])
    .withMessage("Please select a valid role"),
];

const prodReviewValidator = [
  body("productId")
    .trim()
    .isNumeric()
    .withMessage("Product ID must be a number"),
  body("status")
    .trim()
    .isIn(["Approved", "Disapproved"])
    .withMessage("Please select a valid status"),
];

const orderReviewValidator = [
  body("orderId").trim().isNumeric().withMessage("Product ID must be a number"),
  body("status")
    .trim()
    .isIn([
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
    ])
    .withMessage("Please select a valid status"),
];

const disputeReviewValidator = [
  body("disputeId")
    .trim()
    .isNumeric()
    .withMessage("Dispute ID must be a number"),
  body("resolution").trim().notEmpty(),
];

const addPreferenceValidator = [
  body("name")
    .notEmpty()
    .isIn(["max_price", "registration_status"])
    .withMessage("Invalid Preference"),

  body("value")
    .trim()
    .notEmpty()
    .withMessage("Invalid Preference Value")
    .custom((value, { req }) => {
      const name = req.body.name;

      // Check if name is 'max_price' and value should be an integer
      if (name === "max_price") {
        if (!Number.isInteger(Number(value))) {
          throw new Error("Max price should be an integer");
        }
      } else if (name === "registration_status") {
        // If name is 'registration_status', value should be a string (for example, yes/no)
        if (typeof value !== "string" || value.trim().length === 0) {
          throw new Error("Registration status should be a valid string");
        }
        if (!["Approved", "Pending"].includes(value)) {
          throw new Error(
            "Registration status should be either 'Approved' or 'Pending'"
          );
        }
      }
      return true; // indicates validation passed
    }),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Invalid Preference Description"),
];

const createAdminValidator = [
  body("first_name")
    .isLength({ min: 3, max: 20 })
    .withMessage("First name must be between 3 and 20 characters long"),
  body("last_name")
    .isLength({ min: 3, max: 20 })
    .withMessage("Last name must be between 3 and 20 characters long"),
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("phone")
    .optional()
    .isMobilePhone("en-IN")
    .withMessage("Please enter a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = {
  changeUserRoleValidator,
  prodReviewValidator,
  updateUserAccessValidator,
  orderReviewValidator,
  disputeReviewValidator,
  addPreferenceValidator,
  createAdminValidator,
};
