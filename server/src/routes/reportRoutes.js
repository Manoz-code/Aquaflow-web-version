const express = require("express");

const {
  getSummary,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  adminMiddleware,
  getSummary
);

module.exports = router;