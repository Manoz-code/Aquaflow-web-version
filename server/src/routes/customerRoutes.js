const express = require("express");

const {
  getCustomers,
  createCustomer,
  getCustomerById,
  getCustomerSummary,
  deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCustomers);

router.post("/", authMiddleware, createCustomer);

router.get(
  "/:id/summary",
  authMiddleware,
  getCustomerSummary
);

router.get(
  "/:id",
  authMiddleware,
  getCustomerById
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteCustomer
);
module.exports = router;