const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { Op } = require("sequelize");
dotenv.config();

const { Users } = require("../models");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role } = req.body;
    if (!["admin", "seller", "customer"].includes(role)) {
      return res.status(400).send({ success: false, message: "Invalid role" });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    const existingUser = await Users.findOne({
      where: { [Op.or]: [{ email: email }, { phone: phone }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .send({ success: false, message: "Email or Phone is already in use." });
    }

    // Save user to database
    const newUser = await Users.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      role,
    });
    newUser.save();
    res
      .status(201)
      .send({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { email: email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { register, login };
