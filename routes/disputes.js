const express = require("express");
const router = express.Router();
const { Users, Disputes, Orders } = require("../models");
router.get("/get-all-disputes", (req, res) => {
  try {
    const user = req.user;
  } catch (error) {}
});
