const express = require("express");

const {
  getSecurityAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  getUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/adminController");


const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/alerts",
  authMiddleware,
  adminMiddleware,
  getSecurityAlerts
);

router.get(
  "/alerts/unread-count",
  authMiddleware,
  adminMiddleware,
  getUnreadAlertCount
);

router.patch(
  "/alerts/:id/read",
  authMiddleware,
  adminMiddleware,
  markAlertAsRead
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getUsers
);

router.patch(
  "/users/:id/status",
  authMiddleware,
  adminMiddleware,
  updateUserStatus
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);
module.exports = router;