const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// =====================================================
// GET ALL SECURITY ALERTS
// =====================================================

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          sa.id,
          sa.user_id,
          sa.action,
          sa.description,
          sa.ip_address,
          sa.is_read,
          sa.created_at,
          COALESCE(u.name, 'System') AS user_name
        FROM security_alerts sa
        LEFT JOIN users u
          ON sa.user_id = u.id
        ORDER BY sa.created_at DESC
      `);

      res.json({
        success: true,
        alerts: result.rows,
      });

    } catch (error) {
      console.error(
        "Security alerts error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to load security alerts",
      });
    }
  }
);


// =====================================================
// GET UNREAD ALERT COUNT
// =====================================================

router.get(
  "/unread-count",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) AS unread_count
        FROM security_alerts
        WHERE is_read = FALSE
      `);

      res.json({
        success: true,
        unread_count: Number(
          result.rows[0].unread_count
        ),
      });

    } catch (error) {
      console.error(
        "Unread security alerts error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to get unread alert count",
      });
    }
  }
);


// =====================================================
// MARK ONE ALERT AS READ
// =====================================================

router.patch(
  "/:id/read",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE security_alerts
        SET is_read = TRUE
        WHERE id = $1
        RETURNING id, is_read
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Security alert not found",
        });
      }

      res.json({
        success: true,
        message: "Security alert marked as read",
        alert: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Mark alert read error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to mark alert as read",
      });
    }
  }
);


// =====================================================
// MARK ALL ALERTS AS READ
// =====================================================

router.patch(
  "/read-all",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      await pool.query(`
        UPDATE security_alerts
        SET is_read = TRUE
        WHERE is_read = FALSE
      `);

      res.json({
        success: true,
        message: "All security alerts marked as read",
      });

    } catch (error) {
      console.error(
        "Mark all alerts read error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Failed to mark alerts as read",
      });
    }
  }
);


module.exports = router;