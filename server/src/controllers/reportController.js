const pool = require("../config/db");

const getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    // =====================================================
    // VALIDATE DATES
    // =====================================================

    if (
      from &&
      !/^\d{4}-\d{2}-\d{2}$/.test(from)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid 'from' date. Use YYYY-MM-DD",
      });
    }

    if (
      to &&
      !/^\d{4}-\d{2}-\d{2}$/.test(to)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid 'to' date. Use YYYY-MM-DD",
      });
    }

    if (from && to && from > to) {
      return res.status(400).json({
        success: false,
        message:
          "'from' date cannot be after 'to' date",
      });
    }

    // =====================================================
    // DELIVERY DATE FILTER
    // =====================================================

    let deliveryDateCondition = "";
    const deliveryParams = [];

    if (from) {
      deliveryParams.push(from);

      deliveryDateCondition +=
        ` AND d.delivered_at >= $${deliveryParams.length}`;
    }

    if (to) {
      deliveryParams.push(to);

      deliveryDateCondition +=
        ` AND d.delivered_at < ($${deliveryParams.length}::date + INTERVAL '1 day')`;
    }

    // =====================================================
    // DELIVERY STATISTICS
    // =====================================================

    const deliveryResult = await pool.query(
      `
      SELECT
        COUNT(*) AS total_deliveries,

        COUNT(
          DISTINCT d.customer_id
        ) AS customers_served,

        COALESCE(
          SUM(d.quantity_liters),
          0
        ) AS total_liters,

        COALESCE(
          SUM(d.total_amount),
          0
        ) AS total_billed

      FROM deliveries d

      WHERE 1 = 1
      ${deliveryDateCondition}
      `,
      deliveryParams
    );

    // =====================================================
    // PAYMENT DATE FILTER
    // =====================================================

    let paymentDateCondition = "";
    const paymentParams = [];

    if (from) {
      paymentParams.push(from);

      paymentDateCondition +=
        ` AND p.paid_at >= $${paymentParams.length}`;
    }

    if (to) {
      paymentParams.push(to);

      paymentDateCondition +=
        ` AND p.paid_at < ($${paymentParams.length}::date + INTERVAL '1 day')`;
    }

    // =====================================================
    // PAYMENT STATISTICS
    // =====================================================

    const paymentResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(p.amount),
          0
        ) AS total_paid

      FROM payments p

      WHERE p.payment_status IN (
        'partial',
        'paid'
      )

      ${paymentDateCondition}
      `,
      paymentParams
    );

    // =====================================================
    // ACTIVE CUSTOMERS
    // =====================================================

    const customerResult =
      await pool.query(`
        SELECT
          COUNT(*) AS total_customers
        FROM customers
        WHERE status = 'active'
      `);

    // =====================================================
    // CONVERT VALUES
    // =====================================================

    const deliveryStats =
      deliveryResult.rows[0];

    const paymentStats =
      paymentResult.rows[0];

    const customerStats =
      customerResult.rows[0];

    const totalCustomers =
      Number(
        customerStats.total_customers
      );

    const customersServed =
      Number(
        deliveryStats.customers_served
      );

    const totalDeliveries =
      Number(
        deliveryStats.total_deliveries
      );

    const totalLiters =
      Number(
        deliveryStats.total_liters
      );

    const totalBilled =
      Number(
        deliveryStats.total_billed
      );

    const totalPaid =
      Number(
        paymentStats.total_paid
      );

    const outstanding =
      totalBilled - totalPaid;

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.json({
      success: true,

      filters: {
        from: from || null,
        to: to || null,
      },

      summary: {
        total_customers:
          totalCustomers,

        customers_served:
          customersServed,

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
    });
  } catch (error) {
    console.error(
      "Error generating filtered summary:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate summary",
    });
  }
};

module.exports = {
  getSummary,
};