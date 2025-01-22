const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2; // Use v2 for the latest version of Cloudinary SDK
const routes = require("./routes/index");

dotenv.config();
const fileUpload = require("express-fileupload");

// Use express-fileupload middleware to handle file uploads
app.use(fileUpload());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_PASS, // Your Cloudinary API secret
});

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 1 * 1000, // 1 second window
  max: 1, // Only 1 request per second
  handler: (req, res) =>
    res.status(429).send({ success: false, message: "Too many requests" }),
});

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL encoded bodies

cloudinary.api.ping((error, result) => {
  if (error) {
    console.error("Cloudinary connection error:", error);
  } else {
    console.log("Cloudinary connection successful:", result);
  }
});

app.use(limiter);

app.use("/api", routes);

// Start server
app.listen(port, () => console.log(`Server is running on port ${port}`));
