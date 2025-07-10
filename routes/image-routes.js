const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const isAdminUser = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const uploadImageController = require("../controllers/image-controller");
const router = express.Router();

// upload the image -> only available to admin
router.post(
  "/upload",
  authMiddleware,
  isAdminUser,
  uploadMiddleware.single("image"),
  uploadImageController
);

module.exports = router;
