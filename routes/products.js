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

router.get("/", productsController.getAllProducts);
router.patch(
  "/:productId",
  authMiddleware,
  updateProduct,
  handleValidationErrors,
  productsController.updateProduct
);
router.get(
  "/:sellerId",
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
