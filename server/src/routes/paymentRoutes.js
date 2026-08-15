const express = require("express");

const {
  createPayment,
  getPayments,
  getPaymentDeliveries,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET PAYMENT HISTORY
// =====================================================

router.get(
  "/",
  authMiddleware,
  getPayments
);

// =====================================================
// GET DELIVERIES WITH PAYMENT BALANCES
// =====================================================

router.get(
  "/deliveries",
  authMiddleware,
  getPaymentDeliveries
);

// =====================================================
// CREATE PAYMENT TRANSACTION
// =====================================================

router.post(
  "/",
  authMiddleware,
  createPayment
);

module.exports = router;