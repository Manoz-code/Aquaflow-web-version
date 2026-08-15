
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");

const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const driverRoutes = require("./routes/driverRoutes");
const securityRoutes = require("./routes/securityRoutes");

const cleanupSecurityAlerts = require("./utils/securityAlertCleanup");

const pool = require("./config/db");

const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());


// =========================
// API ROUTES
// =========================

app.use("/api/customers", customerRoutes);

app.use("/api/deliveries", deliveryRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/drivers", driverRoutes);

app.use(
  "/api/security-alerts",
  securityRoutes
);


// =========================
// UPLOADS
// =========================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);


// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json({
      success: true,
      message:
        "AquaFlow API and database are connected",
      databaseTime: result.rows[0].now,
    });

  } catch (error) {
    console.error(
      "Database connection error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Database connection failed",
    });
  }
});

// =====================================================
// SECURITY ALERT CLEANUP
// =====================================================

// Run once when server starts
cleanupSecurityAlerts();

// Run every 24 hours
setInterval(() => {
  cleanupSecurityAlerts();
}, 24 * 60 * 60 * 1000);


// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `AquaFlow server running on port ${PORT}`
  );
});
