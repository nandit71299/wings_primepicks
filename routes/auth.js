const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { loginValidator, registerValidator } = require("../validators/auth");
const handleValidationErrors = require("../middlewares/handleValidation");
const authMiddleware = require("../middlewares/auth");

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

router.post("/verification", authMiddleware, authController.verification);
module.exports = router;
