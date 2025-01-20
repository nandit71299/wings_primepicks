const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME_DEV || "root",
    password: process.env.DB_PASSWORD_DEV || null,
    database: process.env.DB_DATABASE_DEV || "primepicks_development",
    host: process.env.DB_HOST_DEV || "127.0.0.1",
    dialect: "mysql", // Explicitly set the dialect
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME_TEST || "root",
    password: process.env.DB_PASSWORD_TEST || null,
    database: process.env.DB_DATABASE_TEST || "primepicks_test",
    host: process.env.DB_HOST_TEST || "127.0.0.1",
    dialect: "mysql", // Explicitly set the dialect
  },
  production: {
    username: process.env.DB_USERNAME_PROD || "root",
    password: process.env.DB_PASSWORD_PROD || null,
    database: process.env.DB_DATABASE_PROD || "primepicks_test",
    host: process.env.DB_HOST_PROD || "127.0.0.1",
    dialect: "mysql", // Explicitly set the dialect
  },
};
