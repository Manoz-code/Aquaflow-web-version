const pool = require("../config/db");

const getSecurityAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        al.id,
        al.user_id,
        u.name AS user_name,
        al.action,
        al.resource,
        al.resource_id,
        al.description,
        al.created_at
      FROM activity_logs al
      LEFT JOIN users u
        ON al.user_id = u.id
      WHERE al.action = 'ACCESS_DENIED'
      ORDER BY al.created_at DESC
      `
    );

    res.json({
      success: true,
      alerts: result.rows,
    });
  } catch (error) {
    console.error("Error fetching security alerts:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch security alerts",
    });
  }
};

const getUnreadAlertCount = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS unread_count
      FROM activity_logs
      WHERE action = 'ACCESS_DENIED'
      AND read_at IS NULL
      `
    );

    res.json({
      success: true,
      unread_count: Number(result.rows[0].unread_count),
    });
  } catch (error) {
    console.error(
      "Error fetching unread alert count:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch unread alert count",
    });
  }
};
const markAlertAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE activity_logs
      SET read_at = NOW()
      WHERE id = $1
        AND action = 'ACCESS_DENIED'
      RETURNING id, read_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert marked as read",
      alert: result.rows[0],
    });
  } catch (error) {
    console.error("Error marking alert as read:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to mark alert as read",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        phone,
        role,
        status,
        profile_image,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Prevent admin from disabling their own account
    if (Number(id) === Number(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        name,
        phone,
        role,
        status,
        profile_image,
        created_at
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User ${status === "active" ? "activated" : "deactivated"} successfully`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user status:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

const deleteUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (Number(id) === Number(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Start transaction
    await client.query("BEGIN");

    // Check staff user exists
    const userResult = await client.query(
      `
      SELECT id, name, phone, role
      FROM users
      WHERE id = $1
        AND role = 'staff'
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Staff user not found",
      });
    }

    // Delete linked driver first
    // Existing deliveries remain because
    // deliveries.driver_id uses ON DELETE SET NULL
    await client.query(
      `
      DELETE FROM drivers
      WHERE user_id = $1
      `,
      [id]
    );

    // Delete the user
    const result = await client.query(
      `
      DELETE FROM users
      WHERE id = $1
        AND role = 'staff'
      RETURNING id, name, phone, role
      `,
      [id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Staff user deleted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Error deleting user:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getSecurityAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
  getUsers,
  updateUserStatus,
  deleteUser,
};