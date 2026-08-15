const pool = require("../config/db");

// =========================================================
// CREATE PAYMENT
// =========================================================

const createPayment = async (req, res) => {
  try {
    const {
      customer_id,
      delivery_id,
      amount,
      payment_method,
      notes,
    } = req.body;

    // =====================================================
    // VALIDATE
    // =====================================================

    if (
      !customer_id ||
      !delivery_id ||
      amount === undefined ||
      !payment_method
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer, delivery, amount, and payment method are required",
      });
    }

    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount must be greater than zero",
      });
    }

    // =====================================================
    // GET DELIVERY
    // =====================================================

    const deliveryResult = await pool.query(
      `
      SELECT
        id,
        customer_id,
        total_amount
      FROM deliveries
      WHERE id = $1
      `,
      [delivery_id]
    );

    if (deliveryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const delivery = deliveryResult.rows[0];

    // =====================================================
    // CHECK CUSTOMER
    // =====================================================

    if (
      String(delivery.customer_id) !==
      String(customer_id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery does not belong to this customer",
      });
    }

    // =====================================================
    // GET TOTAL ALREADY PAID
    // =====================================================

    const paidResult = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS paid_amount

      FROM payments

      WHERE delivery_id = $1
      `,
      [delivery_id]
    );

    const alreadyPaid =
      Number(
        paidResult.rows[0].paid_amount
      );

    const deliveryTotal =
      Number(delivery.total_amount);

    const remainingBalance =
      deliveryTotal - alreadyPaid;

    // =====================================================
    // CHECK ALREADY PAID
    // =====================================================

    if (remainingBalance <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "This delivery has already been fully paid",
      });
    }

    // =====================================================
    // PREVENT OVERPAYMENT
    // =====================================================

    if (paymentAmount > remainingBalance) {
      return res.status(400).json({
        success: false,
        message:
          `Payment exceeds remaining balance of ${remainingBalance.toFixed(
            2
          )}`,
      });
    }

    // =====================================================
    // CREATE PAYMENT TRANSACTION
    // =====================================================

    const result = await pool.query(
      `
      INSERT INTO payments (
        customer_id,
        delivery_id,
        amount,
        payment_method,
        payment_status,
        paid_at,
        notes
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'paid',
        NOW(),
        $5
      )
      RETURNING
        id,
        customer_id,
        delivery_id,
        amount,
        payment_method,
        payment_status,
        paid_at,
        notes,
        created_at
      `,
      [
        customer_id,
        delivery_id,
        paymentAmount,
        payment_method,
        notes || null,
      ]
    );

    // =====================================================
    // CALCULATE NEW BALANCE
    // =====================================================

    const newRemainingBalance =
      remainingBalance - paymentAmount;

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Payment recorded successfully",

      payment: result.rows[0],

      remaining_balance:
        newRemainingBalance,
    });
  } catch (error) {
    console.error(
      "Error recording payment:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to record payment",
    });
  }
};

// =========================================================
// GET PAYMENT HISTORY
// =========================================================

const getPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.customer_id,
        c.name AS customer_name,

        p.delivery_id,

        p.amount,
        p.payment_method,
        p.payment_status,

        p.paid_at,
        p.notes,
        p.created_at

      FROM payments p

      JOIN customers c
        ON c.id = p.customer_id

      ORDER BY
        p.paid_at DESC,
        p.id DESC
      `
    );

    return res.json({
      success: true,
      payments: result.rows,
    });
  } catch (error) {
    console.error(
      "Error getting payments:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load payments",
    });
  }
};

// =========================================================
// GET PAYMENT-READY DELIVERIES
// =========================================================

const getPaymentDeliveries = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        d.id,

        d.customer_id,
        c.name AS customer_name,

        d.quantity_liters,
        d.price_per_liter,
        d.total_amount,
        d.delivery_status,

        COALESCE(
          SUM(p.amount),
          0
        ) AS paid_amount

      FROM deliveries d

      JOIN customers c
        ON c.id = d.customer_id

      LEFT JOIN payments p
        ON p.delivery_id = d.id

      GROUP BY
        d.id,
        d.customer_id,
        c.name,
        d.quantity_liters,
        d.price_per_liter,
        d.total_amount,
        d.delivery_status

      ORDER BY
        d.id DESC
      `
    );

    const deliveries =
      result.rows.map(
        (delivery) => {
          const totalAmount =
            Number(
              delivery.total_amount
            );

          const paidAmount =
            Number(
              delivery.paid_amount
            );

          const remainingBalance =
            totalAmount -
            paidAmount;

          let paymentStatus =
            "pending";

          if (paidAmount > 0 &&
              remainingBalance > 0) {
            paymentStatus =
              "partial";
          }

          if (remainingBalance <= 0) {
            paymentStatus =
              "paid";
          }

          return {
            ...delivery,

            total_amount:
              totalAmount,

            paid_amount:
              paidAmount,

            remaining_balance:
              remainingBalance,

            payment_status:
              paymentStatus,
          };
        }
      );

    return res.json({
      success: true,
      deliveries,
    });
  } catch (error) {
    console.error(
      "Error getting payment deliveries:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load payment deliveries",
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createPayment,
  getPayments,
  getPaymentDeliveries,
};