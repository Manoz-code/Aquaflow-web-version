const express = require("express");

const {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
  reactivateDriver,
} = require("../controllers/driverController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// =========================
// GET ALL DRIVERS
// Authenticated users
// =========================

router.get(
  "/",
  authMiddleware,
  getDrivers
);


// =========================
// GET ONE DRIVER
// Authenticated users
// =========================

router.get(
  "/:id",
  authMiddleware,
  getDriverById
);


// =========================
// CREATE DRIVER
// ADMIN ONLY
// =========================

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createDriver
);


// =========================
// UPDATE DRIVER
// ADMIN ONLY
// =========================

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateDriver
);


// =========================
// DEACTIVATE DRIVER
// ADMIN ONLY
// =========================

router.patch(
  "/:id/deactivate",
  authMiddleware,
  adminMiddleware,
  deactivateDriver
);


// =========================
// REACTIVATE DRIVER
// ADMIN ONLY
// =========================

router.patch(
  "/:id/reactivate",
  authMiddleware,
  adminMiddleware,
  reactivateDriver
);


// =========================
// NO DELETE DRIVER ROUTE
// =========================
// Driver is deleted automatically
// when the linked user is deleted.

module.exports = router;