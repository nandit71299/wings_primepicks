// validators/authValidator.js
const { body } = require("express-validator");

const loginValidator = [
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const registerValidator = [
  body("first_name").notEmpty().withMessage("First name is required"),
  body("last_name").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "seller", "customer"])
    .withMessage("Invalid Role"),
  body("phone").isMobilePhone("en-IN").withMessage("Invalid Phone Number"),
];

module.exports = { loginValidator, registerValidator };
