const express = require("express");
const adminController = require("../controllers/admin");
const authMiddleware = require("../middlewares/auth");
const {
  updateUserAccessValidator,
  changeUserRoleValidator,
  prodReviewValidator,
  orderReviewValidator,
  disputeReviewValidator,
  addPreferenceValidator,
  createAdminValidator,
} = require("../validators/admin");
const handleValidationErrors = require("../middlewares/handleValidation");
const { deleteProduct } = require("../validators/products");

const router = express.Router();

router.patch(
  "/update-user-access",
  authMiddleware,
  updateUserAccessValidator,
  handleValidationErrors,
  adminController.updateUserAccess
);
router.patch(
  "/update-user-role",
  authMiddleware,
  changeUserRoleValidator,
  handleValidationErrors,
  adminController.updateUserRole
);

router.put(
  "/prodreview",
  authMiddleware,
  prodReviewValidator,
  handleValidationErrors,
  adminController.prodReview
);

router.delete(
  "/products/:productId/",
  authMiddleware,
  deleteProduct,
  handleValidationErrors,
  adminController.deleteProduct
);
router.put(
  "/orderreview",
  authMiddleware,
  orderReviewValidator,
  handleValidationErrors,
  adminController.orderReview
);

router.get("/get-all-disputes", authMiddleware, adminController.getAllDisputes);
router.post(
  "/disputereview",
  authMiddleware,
  disputeReviewValidator,
  handleValidationErrors,
  adminController.disputeReview
);

router.post(
  "/addPreference",
  authMiddleware,
  addPreferenceValidator,
  handleValidationErrors,
  adminController.addPreference
);

router.post(
  "/create-admin",
  authMiddleware,
  createAdminValidator,
  handleValidationErrors,
  adminController.createAdmin
);
module.exports = router;
