
import { useEffect, useState } from "react";
import "./Deliveries.css";

import {
  getDeliveries,
  createDelivery,
  updateDeliveryStatus,
  getCustomers,
  getDrivers,
  deleteDelivery,
} from "../services/api";

const Deliveries = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingDelivery, setDeletingDelivery] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: "",
    driver_id: "",
    quantity_liters: "",
    price_per_liter: "",
    extra_charge: "",
    notes: "",
  });

  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [deliveryData, customerData, driverData] =
        await Promise.all([
          getDeliveries(),
          getCustomers(),
          getDrivers(),
        ]);

      console.log("Delivery data:", deliveryData);
      console.log("Customer data:", customerData);
      console.log("Driver data:", driverData);

      setDeliveries(deliveryData?.deliveries || []);
      setCustomers(customerData?.customers || []);
      setDrivers(driverData?.drivers || []);
    } catch (error) {
      console.error("Deliveries page error:", error);

      setError(
        error.message || "Failed to load deliveries"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE QUANTITY
  // =====================================================

  const handleQuantityChange = (event) => {
    const value = event.target.value;

    let automaticPrice = "";

    // 1000 L = Rs. 0.90/L
    if (Number(value) === 1000) {
      automaticPrice = "0.90";
    }

    // 2000 L = Rs. 0.80/L
    if (Number(value) === 2000) {
      automaticPrice = "0.80";
    }

    setFormData((previous) => ({
      ...previous,
      quantity_liters: value,
      price_per_liter:
        automaticPrice || previous.price_per_liter,
    }));
  };

  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const quantity =
    Number(formData.quantity_liters) || 0;

  const price =
    Number(formData.price_per_liter) || 0;

  const extraCharge =
    Number(formData.extra_charge) || 0;

  const calculatedAmount =
    quantity * price + extraCharge;

  // =====================================================
  // OPEN FORM
  // =====================================================

  const openForm = () => {
    setError("");

    setFormData({
      customer_id: "",
      driver_id: "",
      quantity_liters: "",
      price_per_liter: "",
      extra_charge: "",
      notes: "",
    });

    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);

    setFormData({
      customer_id: "",
      driver_id: "",
      quantity_liters: "",
      price_per_liter: "",
      extra_charge: "",
      notes: "",
    });
  };

  // =====================================================
  // CREATE DELIVERY
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      // -------------------------
      // Validate customer
      // -------------------------

      if (!formData.customer_id) {
        setError("Please select a customer");
        return;
      }

      // -------------------------
      // Validate driver
      // -------------------------

      if (!formData.driver_id) {
        setError("Please select a driver");
        return;
      }

      // -------------------------
      // Validate quantity
      // -------------------------

      if (
        !formData.quantity_liters ||
        Number(formData.quantity_liters) <= 0
      ) {
        setError("Quantity must be greater than 0");
        return;
      }

      // -------------------------
      // Validate price
      // -------------------------

      if (
        !formData.price_per_liter ||
        Number(formData.price_per_liter) < 0
      ) {
        setError(
          "Price per liter must be 0 or greater"
        );
        return;
      }

      // -------------------------
      // Validate extra charge
      // -------------------------

      if (
        formData.extra_charge &&
        Number(formData.extra_charge) < 0
      ) {
        setError(
          "Extra distance charge cannot be negative"
        );
        return;
      }

      // =================================================
      // CREATE DELIVERY
      // =================================================

      await createDelivery({
        customer_id: Number(formData.customer_id),

        driver_id: Number(formData.driver_id),

        quantity_liters: Number(
          formData.quantity_liters
        ),

        price_per_liter: Number(
          formData.price_per_liter
        ),

        extra_charge:
          Number(formData.extra_charge) || 0,

        total_amount: calculatedAmount,

        delivery_status: "pending",

        notes: formData.notes.trim(),
      });

      // Reload everything
      await loadData();

      // Reset form
      setFormData({
        customer_id: "",
        driver_id: "",
        quantity_liters: "",
        price_per_liter: "",
        extra_charge: "",
        notes: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error(
        "Create delivery error:",
        error
      );

      setError(
        error.message ||
          "Failed to create delivery"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // UPDATE DELIVERY STATUS
  // =====================================================

  const handleStatusUpdate = async (
    id,
    status
  ) => {
    try {
      setUpdatingStatus(id);
      setError("");

      const data =
        await updateDeliveryStatus(
          id,
          status
        );

      setDeliveries((previous) =>
        previous.map((delivery) =>
          delivery.id === id
            ? {
                ...delivery,
                ...data.delivery,
              }
            : delivery
        )
      );
    } catch (error) {
      console.error(
        "Update delivery status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update delivery status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // =====================================================
  // DELETE DELIVERY
  // =====================================================

  const handleDeleteDelivery = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDelivery(id);
      setError("");

      await deleteDelivery(id);

      setDeliveries((previous) =>
        previous.filter(
          (delivery) => delivery.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete delivery error:",
        error
      );

      setError(
        error.message ||
          "You do not have permission to delete this delivery."
      );
    } finally {
      setDeletingDelivery(null);
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    if (status === "pending") {
      return "delivery-status pending";
    }

    if (status === "delivered") {
      return "delivery-status delivered";
    }

    if (status === "cancelled") {
      return "delivery-status cancelled";
    }

    return "delivery-status";
  };

  // =====================================================
  // STATUS TEXT
  // =====================================================

  const getStatusText = (status) => {
    if (status === "pending") {
      return "Pending";
    }

    if (status === "delivered") {
      return "Delivered";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return status || "Unknown";
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="deliveries-page">

        <section className="deliveries-header">

          <div>

            <h1>
              Deliveries
            </h1>

            <p>
              Manage customer water
              deliveries.
            </p>

          </div>

        </section>

        <div className="deliveries-empty">
          Loading deliveries...
        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="deliveries-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="deliveries-header">

        <div>

          <h1>
            Deliveries
          </h1>

          <p>
            Manage customer water
            deliveries.
          </p>

        </div>

        <button
          type="button"
          className="add-delivery-button"
          onClick={openForm}
        >
          + Add Delivery
        </button>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="deliveries-error">
          {error}
        </div>
      )}


      {/* =================================================
          ADD DELIVERY FORM
      ================================================= */}

      {showForm && (

        <section className="delivery-form-card">

          {/* FORM HEADING */}

          <div className="delivery-form-heading">

            <div>

              <h2>
                Add Delivery
              </h2>

              <p>
                Create a new water
                delivery.
              </p>

            </div>

            <button
              type="button"
              className="close-delivery-form"
              onClick={closeForm}
              disabled={submitting}
            >
              ×
            </button>

          </div>


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            <div className="delivery-form-grid">

              {/* CUSTOMER */}

              <div className="delivery-form-group">

                <label htmlFor="customer_id">
                  Customer
                </label>

                <select
                  id="customer_id"
                  name="customer_id"
                  value={
                    formData.customer_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={submitting}
                >

                  <option value="">
                    Select customer
                  </option>

                  {customers
                    .filter(
                      (customer) =>
                        customer.status ===
                        "active"
                    )
                    .map(
                      (customer) => (

                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                        >
                          {customer.name}
                        </option>

                      )
                    )}

                </select>

              </div>


              {/* DRIVER */}

              <div className="delivery-form-group">

                <label htmlFor="driver_id">
                  Driver
                </label>

                <select
                  id="driver_id"
                  name="driver_id"
                  value={
                    formData.driver_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={submitting}
                >

                  <option value="">
                    Select driver
                  </option>

                  {drivers
                    .filter(
                      (driver) =>
                        driver.status ===
                        "active"
                    )
                    .map(
                      (driver) => (

                        <option
                          key={
                            driver.id
                          }
                          value={
                            driver.id
                          }
                        >
                          {driver.name}

                          {driver.vehicle_number
                            ? ` — ${driver.vehicle_number}`
                            : ""}
                        </option>

                      )
                    )}

                </select>

              </div>


              {/* QUANTITY */}

              <div className="delivery-form-group">

                <label htmlFor="quantity_liters">
                  Quantity (Liters)
                </label>

                <input
                  id="quantity_liters"
                  type="number"
                  name="quantity_liters"
                  value={
                    formData.quantity_liters
                  }
                  onChange={
                    handleQuantityChange
                  }
                  placeholder="e.g. 1000 or 2000"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={submitting}
                />

                <div className="quantity-presets">

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          quantity_liters:
                            "1000",
                          price_per_liter:
                            "0.90",
                        })
                      )
                    }
                  >
                    1000 L
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setFormData(
                        (previous) => ({
                          ...previous,
                          quantity_liters:
                            "2000",
                          price_per_liter:
                            "0.80",
                        })
                      )
                    }
                  >
                    2000 L
                  </button>

                </div>

              </div>


              {/* PRICE */}

              <div className="delivery-form-group">

                <label htmlFor="price_per_liter">
                  Price per Liter
                </label>

                <input
                  id="price_per_liter"
                  type="number"
                  name="price_per_liter"
                  value={
                    formData.price_per_liter
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter price per liter"
                  min="0"
                  step="0.01"
                  required
                  disabled={submitting}
                />

                <small>
                  Automatically filled for
                  1000 L and 2000 L, but
                  you can edit it.
                </small>

              </div>


              {/* EXTRA DISTANCE CHARGE */}

              <div className="delivery-form-group">

                <label htmlFor="extra_charge">
                  Extra Distance Charge
                </label>

                <input
                  id="extra_charge"
                  type="number"
                  name="extra_charge"
                  value={
                    formData.extra_charge
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. 100"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />

              </div>


              {/* TOTAL */}

              <div className="delivery-form-group">

                <label>
                  Total Amount
                </label>

                <div className="delivery-total-preview">

                  Rs.{" "}
                  {calculatedAmount.toLocaleString(
                    "en-NP",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}

                </div>

              </div>


              {/* NOTES */}

              <div className="delivery-form-group full-width">

                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional delivery notes"
                  rows="3"
                  disabled={submitting}
                />

              </div>

            </div>


            {/* FORM ACTIONS */}

            <div className="delivery-form-actions">

              <button
                type="button"
                className="delivery-cancel-button"
                onClick={closeForm}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="delivery-save-button"
                disabled={submitting}
              >
                {submitting
                  ? "Creating..."
                  : "Create Delivery"}
              </button>

            </div>

          </form>

        </section>

      )}


      {/* =================================================
          DELIVERY TABLE
      ================================================= */}

      <section className="deliveries-table-card">

        {/* TABLE HEADING */}

        <div className="deliveries-table-heading">

          <div>

            <h2>
              All Deliveries
            </h2>

            <span>
              {deliveries.length} deliveries
            </span>

          </div>

        </div>


        {/* NO DELIVERIES */}

        {deliveries.length === 0 ? (

          <div className="deliveries-empty">
            No deliveries found.
          </div>

        ) : (

          <div className="deliveries-table-wrapper">

            <table className="deliveries-table">

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Driver
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Price/L
                  </th>

                  <th>
                    Extra Distance
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {deliveries.map(
                  (delivery) => (

                    <tr
                      key={
                        delivery.id
                      }
                    >

                      {/* CUSTOMER */}

                      <td>

                        <strong>
                          {
                            delivery.customer_name
                          }
                        </strong>

                      </td>


                      {/* DRIVER */}

                      <td>

                        {
                          delivery.driver_name ||
                          "—"
                        }

                      </td>


                      {/* QUANTITY */}

                      <td>

                        {
                          delivery.quantity_liters
                        }{" "}
                        L

                      </td>


                      {/* PRICE */}

                      <td>

                        Rs.{" "}
                        {
                          delivery.price_per_liter
                        }

                      </td>


                      {/* EXTRA DISTANCE */}

                      <td>

                        Rs.{" "}
                        {
                          delivery.extra_charge ||
                          "0.00"
                        }

                      </td>


                      {/* TOTAL */}

                      <td>

                        <strong>

                          Rs.{" "}
                          {
                            delivery.total_amount
                          }

                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={getStatusClass(
                            delivery.delivery_status
                          )}
                        >

                          {getStatusText(
                            delivery.delivery_status
                          )}

                        </span>

                      </td>


                      {/* DATE */}

                      <td>

                        {formatDate(
                          delivery.created_at
                        )}

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="delivery-actions">

                          {/* PENDING */}

                          {delivery.delivery_status ===
                            "pending" && (

                            <>

                              <button
                                type="button"
                                className="deliver-button"
                                disabled={
                                  updatingStatus ===
                                    delivery.id ||
                                  deletingDelivery ===
                                    delivery.id
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    delivery.id,
                                    "delivered"
                                  )
                                }
                              >
                                {updatingStatus ===
                                delivery.id
                                  ? "Updating..."
                                  : "Deliver"}
                              </button>


                              <button
                                type="button"
                                className="cancel-delivery-button"
                                disabled={
                                  updatingStatus ===
                                    delivery.id ||
                                  deletingDelivery ===
                                    delivery.id
                                }
                                onClick={() =>
                                  handleStatusUpdate(
                                    delivery.id,
                                    "cancelled"
                                  )
                                }
                              >
                                {updatingStatus ===
                                delivery.id
                                  ? "Updating..."
                                  : "Cancel"}
                              </button>

                            </>

                          )}


                          {/* DELIVERED */}

                          {delivery.delivery_status ===
                            "delivered" && (

                            <span className="action-completed">
                              Completed
                            </span>

                          )}


                          {/* CANCELLED */}

                          {delivery.delivery_status ===
                            "cancelled" && (

                            <span className="action-cancelled">
                              Cancelled
                            </span>

                          )}


                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-delivery-button"
                            disabled={
                              deletingDelivery ===
                                delivery.id ||
                              updatingStatus ===
                                delivery.id
                            }
                            onClick={() =>
                              handleDeleteDelivery(
                                delivery.id
                              )
                            }
                          >

                            {deletingDelivery ===
                            delivery.id
                              ? "Deleting..."
                              : "Delete"}

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
};

export default Deliveries;

