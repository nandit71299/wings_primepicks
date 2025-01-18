const jwt = require("jsonwebtoken");

module.exports = authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate token",
    });
  }
};
