const pool = require("../config/db");

const cleanupSecurityAlerts = async () => {
  try {
    const result = await pool.query(`
      DELETE FROM security_alerts
      WHERE created_at < NOW() - INTERVAL '30 days'
    `);

    if (result.rowCount > 0) {
      console.log(
        `Security alert cleanup: deleted ${result.rowCount} old alert(s)`
      );
    }
  } catch (error) {
    console.error(
      "Security alert cleanup error:",
      error.message
    );
  }
};

module.exports = cleanupSecurityAlerts;