// middleware/handleValidationErrors.js
const { validationResult } = require("express-validator");

// Custom middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // Continue to the next middleware/route handler if no errors
};

module.exports = handleValidationErrors;
