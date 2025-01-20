const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const authController = require("../controllers/auth");
const { loginValidator, registerValidator } = require("../validators/auth");
const handleValidationErrors = require("../middlewares/handleValidation");

//Common
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

module.exports = router;
