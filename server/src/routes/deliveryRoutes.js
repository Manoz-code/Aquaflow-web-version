
const express = require("express");

const {
  createDelivery,
  getDeliveries,
  updateDeliveryStatus,
  deleteDelivery,
} = require("../controllers/deliveryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all deliveries
router.get(
  "/",
  authMiddleware,
  getDeliveries
);

// CREATE delivery
router.post(
  "/",
  authMiddleware,
  createDelivery
);

// UPDATE delivery status
router.patch(
  "/:id/status",
  authMiddleware,
  updateDeliveryStatus
);

// DELETE delivery
router.delete(
  "/:id",
  authMiddleware,
  deleteDelivery
);
module.exports = router;