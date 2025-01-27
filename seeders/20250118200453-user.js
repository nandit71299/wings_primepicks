"use strict";
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const genSalt = async () => {
  return Number(await process.env.SALT_ROUNDS);
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Resolve the salt before hashing the passwords
    const saltRounds = await genSalt(); // Get the salt rounds value

    // Hash passwords before inserting into DB
    const hashedPasswords = await Promise.all([
      bcrypt.hash("admin", saltRounds),
      bcrypt.hash("customer", saltRounds),
      bcrypt.hash("seller", saltRounds),
    ]);

    // Insert the users with hashed passwords
    await queryInterface.bulkInsert("Users", [
      {
        first_name: "Nick",
        last_name: "Thomas",
        email: "customer@primepicks.com",
        password: hashedPasswords[1],
        role: "customer",
      },
      {
        first_name: "John",
        last_name: "Doe",
        email: "admin@primepicks.com",
        password: hashedPasswords[0],
        role: "admin",
      },
      {
        first_name: "Haily",
        last_name: "English",
        email: "seller@primepicks.com",
        password: hashedPasswords[2],
        role: "seller",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("User", null, {});
  },
};
