const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
dotenv.config();
const routes = require("./routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 1 * 1000,
  max: 1,
  handler: (req, res) =>
    res.status(429).send({ success: false, message: "Too many requests" }),
});

// Apply to all routes
app.use(limiter);

app.get("/", (req, res) => res.send("Hello World!"));

app.use("/api", routes);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
