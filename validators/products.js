const { body, header, param } = require("express-validator");

const createProduct = [
  body("name").trim().notEmpty().withMessage("Product Name is required"),
  body("category")
    .trim()
    .isNumeric()
    .withMessage("Product Category is required"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product Description is required"),
  body("price").trim().isFloat().withMessage("Product Price is required"),
  body("available_quantity")
    .trim()
    .isNumeric()
    .withMessage("Product Quantity is required"),
];

const getAllStoreProducts = [
  param("sellerId").trim().isNumeric().withMessage("Invalid store Id"),
];

const getStoreProduct = [
  param("sellerId").trim().isNumeric().withMessage("Seller ID is required"),
  param("productId").trim().isNumeric().withMessage("Product ID is required"),
];

const updateProduct = [
  // Name is optional, but if provided, it must not be empty
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product Name cannot be empty"),

  // Category is optional, but if provided, it must be numeric
  body("category")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("Product Category must be a number"),

  // Description is optional, but if provided, it must not be empty
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product Description cannot be empty"),

  // Price is optional, but if provided, it must be a valid number
  body("price")
    .optional()
    .trim()
    .isFloat()
    .withMessage("Product Price must be a valid number"),

  // Available Quantity is optional, but if provided, it must be numeric
  body("available_quantity")
    .optional()
    .trim()
    .isNumeric()
    .withMessage("Product Quantity must be a number"),
];

const deleteProduct = [
  param("productId").trim().isNumeric().withMessage("Product ID is required"),
];

module.exports = {
  createProduct,
  getStoreProduct,
  getAllStoreProducts,
  updateProduct,
  deleteProduct,
};
