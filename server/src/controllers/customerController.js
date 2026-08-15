const pool = require("../config/db");

// =====================================================
// GET ALL CUSTOMERS
// =====================================================

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        phone,
        address,
        status,
        created_at
      FROM customers
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      customers: result.rows,
    });
  } catch (error) {
    console.error(
      "Error fetching customers:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

// =====================================================
// CREATE CUSTOMER
// =====================================================

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
    } = req.body;

    // -------------------------------------------------
    // VALIDATE REQUIRED FIELDS
    // -------------------------------------------------

    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone, and address are required",
      });
    }

    // -------------------------------------------------
    // CREATE CUSTOMER
    // -------------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO customers (
        name,
        phone,
        address
      )
      VALUES ($1, $2, $3)

      RETURNING
        id,
        name,
        phone,
        address,
        status,
        created_at
      `,
      [
        name,
        phone,
        address,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Customer created successfully",
      customer: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error creating customer:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create customer",
    });
  }
};

// =====================================================
// GET CUSTOMER BY ID
// =====================================================

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        address,
        status,
        created_at
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.json({
      success: true,
      customer: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error fetching customer:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer",
    });
  }
};

// =====================================================
// GET CUSTOMER SUMMARY
// =====================================================

const getCustomerSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // =================================================
    // GET CUSTOMER
    // =================================================

    const customerResult = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        address,
        status,
        created_at
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    // =================================================
    // GET DELIVERY SUMMARY
    // =================================================
    //
    // Separate query prevents payment/delivery
    // row multiplication.
    //
    // =================================================

    const summaryResult = await pool.query(
      `
      SELECT
        COUNT(d.id) AS total_deliveries,

        COALESCE(
          SUM(d.quantity_liters),
          0
        ) AS total_liters,

        COALESCE(
          SUM(d.total_amount),
          0
        ) AS total_billed

      FROM deliveries d

      WHERE d.customer_id = $1
      `,
      [id]
    );

    // =================================================
    // GET PAYMENT SUMMARY
    // =================================================

    const paymentSummaryResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            SUM(p.amount),
            0
          ) AS total_paid

        FROM payments p

        WHERE p.customer_id = $1
        `,
        [id]
      );

    // =================================================
    // GET DELIVERY HISTORY
    // =================================================

    const deliveriesResult =
      await pool.query(
        `
        SELECT
          d.id,

          d.driver_id,
          dr.name AS driver_name,

          d.quantity_liters,
          d.price_per_liter,

          d.distance,
          d.extra_charge,

          d.total_amount,

          d.delivery_status,
          d.delivered_at,

          d.notes,
          d.created_at,
          d.updated_at

        FROM deliveries d

        LEFT JOIN drivers dr
          ON d.driver_id = dr.id

        WHERE d.customer_id = $1

        ORDER BY
          d.created_at DESC
        `,
        [id]
      );

    // =================================================
    // GET PAYMENT HISTORY
    // =================================================

    const paymentsResult =
      await pool.query(
        `
        SELECT
          p.id,

          p.delivery_id,

          p.amount,
          p.payment_method,
          p.payment_status,

          p.paid_at,
          p.notes,
          p.created_at

        FROM payments p

        WHERE p.customer_id = $1

        ORDER BY
          p.created_at DESC
        `,
        [id]
      );

    // =================================================
    // CONVERT SUMMARY VALUES
    // =================================================

    const summary =
      summaryResult.rows[0];

    const totalDeliveries =
      Number(
        summary.total_deliveries
      );

    const totalLiters =
      Number(
        summary.total_liters
      );

    const totalBilled =
      Number(
        summary.total_billed
      );

    const totalPaid =
      Number(
        paymentSummaryResult
          .rows[0]
          .total_paid
      );

    const outstanding =
      totalBilled - totalPaid;

    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      customer:
        customerResult.rows[0],

      summary: {
        total_deliveries:
          totalDeliveries,

        total_liters:
          totalLiters,

        total_billed:
          totalBilled,

        total_paid:
          totalPaid,

        outstanding:
          outstanding,
      },

      deliveries:
        deliveriesResult.rows,

      payments:
        paymentsResult.rows,
    });
  } catch (error) {
    console.error(
      "Error generating customer summary:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate customer summary",
    });
  }
};

// =====================================================
// DEACTIVATE CUSTOMER
// =====================================================

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE customers

      SET
        status = 'inactive'

      WHERE id = $1

      RETURNING
        id,
        name,
        phone,
        address,
        status
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Customer deactivated successfully",
      customer:
        result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error deactivating customer:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate customer",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  getCustomerSummary,
  deleteCustomer,
};