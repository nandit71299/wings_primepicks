const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();
const routes = require("./routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello World!"));

app.use("/api", routes);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
