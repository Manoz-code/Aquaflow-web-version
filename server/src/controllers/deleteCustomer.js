const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM customers
      WHERE id = $1
      RETURNING id, name
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
      customer: result.rows[0],
    });

  } catch (error) {
    console.error("Delete customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};

module.exports = {
  // existing controllers...
  deleteCustomer,
};