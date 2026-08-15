const express = require("express");

const {
  login,
  registerAdmin,
  registerStaff,
  getProfile,
  updateProfile,
  changePassword,
  updateProfileImage,
} = require("../controllers/authController");


const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const uploadProfileImage = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register-admin", registerAdmin);

router.post("/login", login);

// Only admin can create staff accounts
router.post(
  "/register-staff",
  authMiddleware,
  adminMiddleware,
  registerStaff
);

// Get logged-in user's profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// Update logged-in user's name
router.patch(
  "/profile",
  authMiddleware,
  updateProfile
);

// Change logged-in user's password
router.patch(
  "/change-password",
  authMiddleware,
  changePassword
);

router.patch(
  "/profile/image",
  authMiddleware,
  uploadProfileImage.single("profile_image"),
  updateProfileImage
);
module.exports = router;