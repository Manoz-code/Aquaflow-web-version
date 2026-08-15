const deleteUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // ---------------------------------
    // Prevent deleting your own account
    // ---------------------------------

    if (Number(id) === Number(req.user.userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // ---------------------------------
    // Start transaction
    // ---------------------------------

    await client.query("BEGIN");

    // ---------------------------------
    // Check that the user exists
    // and is a staff user
    // ---------------------------------

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

    // ---------------------------------
    // Delete linked driver
    // ---------------------------------
    // Because deliveries.driver_id uses
    // ON DELETE SET NULL, deliveries
    // will remain in the database.

    await client.query(
      `
      DELETE FROM drivers
      WHERE user_id = $1
      `,
      [id]
    );

    // ---------------------------------
    // Delete the user
    // ---------------------------------

    const result = await client.query(
      `
      DELETE FROM users
      WHERE id = $1
        AND role = 'staff'
      RETURNING id, name, phone, role
      `,
      [id]
    );

    // ---------------------------------
    // Commit transaction
    // ---------------------------------

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Staff user deleted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    // ---------------------------------
    // Rollback if anything fails
    // ---------------------------------

    await client.query("ROLLBACK");

    console.error("Delete user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  // existing controllers...
  deleteUser,
};