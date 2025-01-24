// Required Dependencies
const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();
const port = 3000;

dotenv.config();

const routes = require("./routes/index");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_PASS,
});

cloudinary.api.ping((error, result) => {
  if (error) {
    console.error("Cloudinary connection error:", error);
  } else {
    console.log("Cloudinary connection successful");
  }
});

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 100,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: "Too many requests" });
  },
});

app.use(limiter);

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
