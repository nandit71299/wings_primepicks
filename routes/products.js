const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const productsController = require("../controllers/products");
const handleValidationErrors = require("../middlewares/handleValidation");
const authMiddleware = require("../middlewares/auth");
const {
  createProduct,
  getStoreProduct,
  getAllStoreProducts,
  updateProduct,
  deleteProduct,
} = require("../validators/products");

//Customer
router.get("/", productsController.getAllProducts);
router.get(
  "/products-by-categories",
  productsController.getProductsByCategories
);
router.get("/getAllCategories", productsController.getAllCategories);

router.get("/:id", productsController.getSingle);
//Commons
router.get(
  "/all/:sellerId",
  getAllStoreProducts,
  handleValidationErrors,
  productsController.getAllStoreProducts
);
router.get(
  "/:sellerId/:productId",
  getStoreProduct,
  handleValidationErrors,
  productsController.getStoreProduct
);

//Seller
router.patch(
  "/:productId",
  authMiddleware,
  updateProduct,
  handleValidationErrors,
  productsController.updateProduct
);
router.post(
  "/",
  authMiddleware,
  createProduct,
  handleValidationErrors,
  productsController.createProduct
);

router.delete(
  "/:productId/",
  authMiddleware,
  deleteProduct,
  handleValidationErrors,
  productsController.deleteProduct
);

module.exports = router;
