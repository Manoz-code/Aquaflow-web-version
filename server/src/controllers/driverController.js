const pool = require("../config/db");

// =========================
// GET ALL DRIVERS
// =========================

const getDrivers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,
        d.user_id,
        u.name,
        u.phone,
        u.role,
        u.status AS user_status,
        d.status,
        d.created_at,
        d.updated_at
      FROM drivers d
      JOIN users u
        ON d.user_id = u.id
      ORDER BY d.id DESC
    `);

    res.json({
      success: true,
      drivers: result.rows,
    });
  } catch (error) {
    console.error(
      "Error fetching drivers:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to load drivers",
    });
  }
};


// =========================
// GET ONE DRIVER
// =========================

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        d.id,
        d.user_id,
        u.name,
        u.phone,
        u.role,
        u.status AS user_status,
        d.status,
        d.created_at,
        d.updated_at
      FROM drivers d
      JOIN users u
        ON d.user_id = u.id
      WHERE d.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.json({
      success: true,
      driver: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error fetching driver:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
    });
  }
};


// =========================
// CREATE DRIVER
// ADMIN ONLY
// =========================
// Driver is created from an existing user.

const createDriver = async (req, res) => {
  try {
    const { user_id } = req.body;

    // -------------------------
    // Validate user_id
    // -------------------------

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    // -------------------------
    // Check user
    // -------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        role,
        status
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------
    // User must be active
    // -------------------------

    if (user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "User is inactive",
      });
    }

    // -------------------------
    // Check if already driver
    // -------------------------

    const existingDriver = await pool.query(
      `
      SELECT id
      FROM drivers
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (existingDriver.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This user is already a driver",
      });
    }

    // -------------------------
    // Create driver
    // -------------------------

    const result = await pool.query(
      `
      INSERT INTO drivers (
        user_id,
        name,
        phone,
        status
      )
      VALUES ($1, $2, $3, 'active')
      RETURNING
        id,
        user_id,
        name,
        phone,
        status,
        created_at,
        updated_at
      `,
      [
        user.id,
        user.name,
        user.phone || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      driver: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Error creating driver:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create driver",
    });
  }
};


// =========================
// UPDATE DRIVER
// ADMIN ONLY
// =========================

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // -------------------------
    // Validate user_id
    // -------------------------

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    // -------------------------
    // Check user
    // -------------------------

    const userResult = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        role,
        status
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -------------------------
    // User must be active
    // -------------------------

    if (user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "User is inactive",
      });
    }

    // -------------------------
    // Check duplicate driver
    // -------------------------

    const duplicateResult = await pool.query(
      `
      SELECT id
      FROM drivers
      WHERE user_id = $1
        AND id != $2
      `,
      [user_id, id]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This user is already a driver",
      });
    }

    // -------------------------
    // Update driver
    // -------------------------

    const result = await pool.query(
      `
      UPDATE drivers
      SET
        user_id = $1,
        name = $2,
        phone = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING
        id,
        user_id,
        name,
        phone,
        status,
        created_at,
        updated_at
      `,
      [
        user.id,
        user.name,
        user.phone || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.json({
      success: true,
      message: "Driver updated successfully",
      driver: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Error updating driver:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update driver",
    });
  }
};


// =========================
// DEACTIVATE DRIVER
// ADMIN ONLY
// =========================

const deactivateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE drivers
      SET
        status = 'inactive',
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        user_id,
        name,
        phone,
        status,
        updated_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.json({
      success: true,
      message: "Driver deactivated successfully",
      driver: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Error deactivating driver:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to deactivate driver",
    });
  }
};


// =========================
// REACTIVATE DRIVER
// ADMIN ONLY
// =========================

const reactivateDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------
    // Check linked user
    // -------------------------

    const userResult = await pool.query(
      `
      SELECT
        u.status AS user_status
      FROM drivers d
      JOIN users u
        ON d.user_id = u.id
      WHERE d.id = $1
      `,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // -------------------------
    // User must be active
    // -------------------------

    if (
      userResult.rows[0].user_status !==
      "active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot reactivate driver because the user is inactive",
      });
    }

    // -------------------------
    // Reactivate driver
    // -------------------------

    const result = await pool.query(
      `
      UPDATE drivers
      SET
        status = 'active',
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        user_id,
        name,
        phone,
        status,
        updated_at
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Driver reactivated successfully",
      driver: result.rows[0],
    });

  } catch (error) {
    console.error(
      "Error reactivating driver:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to reactivate driver",
    });
  }
};


// =========================
// EXPORT
// =========================

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
  reactivateDriver,
};