const pool = require("../config/db");

const logActivity = async ({
  userId,
  action,
  resource,
  resourceId,
  description,
  ipAddress,
}) => {
  try {
    await pool.query(
      `
      INSERT INTO activity_logs (
        user_id,
        action,
        resource,
        resource_id,
        description,
        ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        userId || null,
        action,
        resource || null,
        resourceId || null,
        description,
        ipAddress || null,
      ]
    );
  } catch (error) {
    // Logging should never crash the main request
    console.error("Activity logging error:", error.message);
  }
};

module.exports = logActivity;