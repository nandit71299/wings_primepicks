const jwt = require("jsonwebtoken");

module.exports = authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user information to the request
    req.user = decoded;

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Check if the error is due to token expiration
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    // Handle other errors (invalid token, malformed token, etc.)
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate token",
    });
  }
};
