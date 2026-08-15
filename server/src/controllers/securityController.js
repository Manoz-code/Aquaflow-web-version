const pool = require("../config/db");

const getSecurityAlerts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sa.id,
        sa.user_id,
        sa.action,
        sa.description,
        sa.ip_address,
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
      "Get security alerts error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to load security alerts",
    });
  }
};

module.exports = {
  getSecurityAlerts,
};