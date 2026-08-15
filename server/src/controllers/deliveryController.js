const pool = require("../config/db");

// =====================================================
// CREATE DELIVERY
// =====================================================

const createDelivery = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      driver_id,
      quantity_liters,
      price_per_liter,
      distance,
      extra_charge,
      total_amount,
      delivery_status,
      notes,
    } = req.body;

    // =================================================
    // VALIDATE REQUIRED FIELDS
    // =================================================

    if (
      !customer_id ||
      !driver_id ||
      quantity_liters === undefined ||
      total_amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer, driver, quantity, and total amount are required",
      });
    }

    // =================================================
    // CONVERT NUMBERS
    // =================================================

    const quantity = Number(quantity_liters);

    const price =
      price_per_liter === undefined ||
      price_per_liter === ""
        ? 0
        : Number(price_per_liter);

    const deliveryDistance =
      distance === undefined ||
      distance === ""
        ? 0
        : Number(distance);

    const extraCharge =
      extra_charge === undefined ||
      extra_charge === ""
        ? 0
        : Number(extra_charge);

    const finalAmount = Number(total_amount);

    // =================================================
    // VALIDATE QUANTITY
    // =================================================

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    // =================================================
    // VALIDATE PRICE
    // =================================================

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price per liter cannot be negative",
      });
    }

    // =================================================
    // VALIDATE DISTANCE
    // =================================================

    if (
      !Number.isFinite(deliveryDistance) ||
      deliveryDistance < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Distance cannot be negative",
      });
    }

    // =================================================
    // VALIDATE EXTRA CHARGE
    // =================================================

    if (
      !Number.isFinite(extraCharge) ||
      extraCharge < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Extra charge cannot be negative",
      });
    }

    // =================================================
    // VALIDATE TOTAL AMOUNT
    // =================================================

    if (
      !Number.isFinite(finalAmount) ||
      finalAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Total amount cannot be negative",
      });
    }

    // =================================================
    // VALIDATE DELIVERY STATUS
    // =================================================

    const allowedStatuses = [
      "pending",
      "delivered",
      "cancelled",
    ];

    const status = delivery_status || "pending";

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid delivery status. Use pending, delivered, or cancelled",
      });
    }

    // =================================================
    // CHECK CUSTOMER
    // =================================================

    const customerResult = await pool.query(
      `
      SELECT
        id,
        name,
        status
      FROM customers
      WHERE id = $1
      `,
      [customer_id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customerResult.rows[0];

    if (customer.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Customer is inactive",
      });
    }

    // =================================================
    // CHECK DRIVER
    // =================================================

    const driverResult = await pool.query(
      `
      SELECT
        d.id,
        d.name,
        d.phone,
        d.status AS driver_status,
        u.status AS user_status
      FROM drivers d
      LEFT JOIN users u
        ON d.user_id = u.id
      WHERE d.id = $1
      `,
      [driver_id]
    );

    if (driverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const driver = driverResult.rows[0];

    if (driver.driver_status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Driver is inactive",
      });
    }

    if (
      driver.user_status !== null &&
      driver.user_status !== "active"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Driver's user account is inactive",
      });
    }

    // =================================================
    // START TRANSACTION
    // =================================================

    await client.query("BEGIN");

    // =================================================
    // CREATE DELIVERY
    // =================================================

    const deliveryResult = await client.query(
      `
      INSERT INTO deliveries (
        customer_id,
        driver_id,
        quantity_liters,
        price_per_liter,
        distance,
        extra_charge,
        total_amount,
        delivery_status,
        delivered_at,
        notes
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING
        id,
        customer_id,
        driver_id,
        quantity_liters,
        price_per_liter,
        distance,
        extra_charge,
        total_amount,
        delivery_status,
        delivered_at,
        notes,
        created_at
      `,
      [
        customer_id,
        driver_id,
        quantity,
        price,
        deliveryDistance,
        extraCharge,
        finalAmount,
        status,
        status === "delivered"
          ? new Date()
          : null,
        notes || null,
      ]
    );

    const delivery = deliveryResult.rows[0];

    // =================================================
    // COMMIT
    // =================================================

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      delivery,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError.message
      );
    }

    console.error(
      "Error creating delivery:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create delivery",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// GET ALL DELIVERIES
// =====================================================

const getDeliveries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id,

        d.customer_id,
        c.name AS customer_name,
        c.address AS customer_address,

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

      JOIN customers c
        ON d.customer_id = c.id

      LEFT JOIN drivers dr
        ON d.driver_id = dr.id

      ORDER BY d.created_at DESC
    `);

    return res.json({
      success: true,
      deliveries: result.rows,
    });
  } catch (error) {
    console.error(
      "Error fetching deliveries:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries",
    });
  }
};

// =====================================================
// UPDATE DELIVERY STATUS
// =====================================================

const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_status } = req.body;

    const allowedStatuses = [
      "pending",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(delivery_status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use pending, delivered, or cancelled",
      });
    }

    const currentResult = await pool.query(
      `
      SELECT
        id,
        delivery_status
      FROM deliveries
      WHERE id = $1
      `,
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const currentStatus =
      currentResult.rows[0].delivery_status;

    if (
      currentStatus === "delivered" &&
      delivery_status !== "delivered"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A delivered delivery cannot be changed",
      });
    }

    if (
      currentStatus === "cancelled" &&
      delivery_status !== "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A cancelled delivery cannot be changed",
      });
    }

    const deliveredAt =
      delivery_status === "delivered"
        ? new Date()
        : null;

    const result = await pool.query(
      `
      UPDATE deliveries
      SET
        delivery_status = $1,
        delivered_at = $2,
        updated_at = NOW()
      WHERE id = $3

      RETURNING
        id,
        customer_id,
        driver_id,
        quantity_liters,
        price_per_liter,
        distance,
        extra_charge,
        total_amount,
        delivery_status,
        delivered_at,
        notes,
        created_at,
        updated_at
      `,
      [
        delivery_status,
        deliveredAt,
        id,
      ]
    );

    return res.json({
      success: true,
      message:
        "Delivery status updated successfully",
      delivery: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Error updating delivery status:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update delivery status",
    });
  }
};

// =====================================================
// DELETE DELIVERY
// =====================================================

const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.userId;
    const userRole = req.user.role;

    // =================================================
    // CHECK DELIVERY EXISTS
    // =================================================

    const deliveryResult = await pool.query(
      `
      SELECT
        d.id,
        d.customer_id,
        d.delivery_status,
        c.name AS customer_name
      FROM deliveries d

      JOIN customers c
        ON d.customer_id = c.id

      WHERE d.id = $1
      `,
      [id]
    );

    if (deliveryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const delivery = deliveryResult.rows[0];

    // =================================================
    // STAFF ATTEMPT
    // =================================================

    if (userRole !== "admin") {
      await pool.query(
        `
        INSERT INTO security_alerts (
          user_id,
          action,
          description,
          ip_address
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          userId,
          "DELETE_DELIVERY_ATTEMPT",
          `Staff user attempted to delete delivery #${delivery.id} for customer "${delivery.customer_name}"`,
          req.ip,
        ]
      );

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete deliveries. The administrator has been notified.",
      });
    }

    // =================================================
    // CHECK PAYMENTS
    // =================================================

    const paymentResult = await pool.query(
      `
      SELECT
        id
      FROM payments
      WHERE delivery_id = $1
      LIMIT 1
      `,
      [id]
    );

    if (paymentResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This delivery cannot be deleted because it has payment records.",
      });
    }

    // =================================================
    // DELETE DELIVERY
    // =================================================

    await pool.query(
      `
      DELETE FROM deliveries
      WHERE id = $1
      `,
      [id]
    );

    return res.json({
      success: true,
      message: "Delivery deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete delivery error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete delivery",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createDelivery,
  getDeliveries,
  updateDeliveryStatus,
  deleteDelivery,
};