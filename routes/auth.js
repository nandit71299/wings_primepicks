const express = require("express");
const router = express.Router(); // Use Router instance
const { validationResult } = require("express-validator");
const authController = require("../controllers/auth");
const { loginValidator, registerValidator } = require("../validators/auth");
const handleValidationErrors = require("../middlewares/handleValidation");

// Define routes within the auth router
router.post(
  "/login",
  loginValidator,
  handleValidationErrors,
  authController.login
);
router.post(
  "/register",
  registerValidator,
  handleValidationErrors,
  authController.register
);

module.exports = router; // Export the router
