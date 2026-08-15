import { useEffect, useState } from "react";
import "./Payments.css";

import {
  getPayments,
  createPayment,
  getPaymentDeliveries,
} from "../services/api";

const Payments = () => {
  // =========================
  // STATE
  // =========================

  const [payments, setPayments] = useState([]);
  const [paymentDeliveries, setPaymentDeliveries] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({
    customer_id: "",
    delivery_id: "",
    amount: "",
    payment_method: "cash",
    notes: "",
  });

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        paymentData,
        deliveryData,
      ] = await Promise.all([
        getPayments(),
        getPaymentDeliveries(),
      ]);

      setPayments(
        paymentData?.payments || []
      );

      setPaymentDeliveries(
        deliveryData?.deliveries || []
      );
    } catch (error) {
      console.error(
        "Payments page error:",
        error
      );

      setError(
        error.message ||
          "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "—";

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

  // =========================
  // OUTSTANDING DELIVERIES
  // =========================

  const outstandingDeliveries =
    paymentDeliveries.filter(
      (delivery) =>
        Number(
          delivery.remaining_balance
        ) > 0
    );

  // =========================
  // SELECTED DELIVERY
  // =========================

  const selectedDelivery =
    paymentDeliveries.find(
      (delivery) =>
        String(delivery.id) ===
        String(formData.delivery_id)
    );

  // =========================
  // REMAINING BALANCE
  // =========================

  const remainingBalance =
    selectedDelivery
      ? Number(
          selectedDelivery.remaining_balance
        )
      : 0;

  // =========================
  // CURRENT FORM AMOUNT
  // =========================

  const paymentAmount =
    Number(formData.amount) || 0;

  // =========================
  // OPEN PAYMENT FORM
  // =========================

  const openPayment = (delivery) => {
    setError("");

    setFormData({
      customer_id:
        String(
          delivery.customer_id
        ),

      delivery_id:
        String(delivery.id),

      amount: "",

      payment_method: "cash",

      notes: "",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE PAYMENT FORM
  // =========================

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);

    setFormData({
      customer_id: "",
      delivery_id: "",
      amount: "",
      payment_method: "cash",
      notes: "",
    });
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT PAYMENT
  // =========================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      // -------------------------
      // DELIVERY
      // -------------------------

      if (!formData.delivery_id) {
        setError(
          "No delivery selected"
        );
        return;
      }

      // -------------------------
      // AMOUNT
      // -------------------------

      if (
        !formData.amount ||
        paymentAmount <= 0
      ) {
        setError(
          "Payment amount must be greater than zero"
        );
        return;
      }

      // -------------------------
      // PREVENT OVERPAYMENT
      // -------------------------

      if (
        paymentAmount >
        remainingBalance
      ) {
        setError(
          `Payment cannot exceed remaining balance of Rs. ${formatMoney(
            remainingBalance
          )}`
        );

        return;
      }

      // -------------------------
      // CREATE ACTUAL PAYMENT
      // -------------------------

      await createPayment(
        Number(
          formData.customer_id
        ),

        Number(
          formData.delivery_id
        ),

        paymentAmount,

        formData.payment_method,

        formData.notes.trim()
      );

      // -------------------------
      // REFRESH
      // -------------------------

      await loadData();

      // -------------------------
      // CLOSE
      // -------------------------

      setShowForm(false);

      setFormData({
        customer_id: "",
        delivery_id: "",
        amount: "",
        payment_method: "cash",
        notes: "",
      });
    } catch (error) {
      console.error(
        "Create payment error:",
        error
      );

      setError(
        error.message ||
          "Failed to record payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="payments-page">
        <section className="payments-header">
          <div>
            <h1>Payments</h1>

            <p>
              Manage customer payments
              and outstanding balances.
            </p>
          </div>
        </section>

        <div className="payments-empty">
          Loading payments...
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="payments-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="payments-header">
        <div>
          <h1>Payments</h1>

          <p>
            Manage customer payments
            and outstanding balances.
          </p>
        </div>
      </section>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="payments-error">
          {error}
        </div>
      )}

      {/* =========================
          PAYMENT FORM
      ========================= */}

      {showForm &&
        selectedDelivery && (
          <section className="payment-form-card">

            <div className="payment-form-heading">
              <div>
                <h2>
                  Record Payment
                </h2>

                <p>
                  Record the amount
                  actually received
                  from the customer.
                </p>
              </div>

              <button
                type="button"
                className="close-payment-form"
                onClick={closeForm}
                disabled={submitting}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
            >

              {/* =========================
                  BALANCE SUMMARY
              ========================= */}

              <div className="payment-balance-card">

                <div className="payment-balance-item">
                  <span>
                    Customer
                  </span>

                  <strong>
                    {
                      selectedDelivery.customer_name
                    }
                  </strong>
                </div>

                <div className="payment-balance-item">
                  <span>
                    Delivery
                  </span>

                  <strong>
                    #
                    {
                      selectedDelivery.id
                    }
                  </strong>
                </div>

                <div className="payment-balance-item">
                  <span>
                    Delivery Total
                  </span>

                  <strong>
                    Rs.{" "}
                    {formatMoney(
                      selectedDelivery.total_amount
                    )}
                  </strong>
                </div>

                <div className="payment-balance-item">
                  <span>
                    Already Paid
                  </span>

                  <strong>
                    Rs.{" "}
                    {formatMoney(
                      selectedDelivery.paid_amount
                    )}
                  </strong>
                </div>

                <div className="payment-balance-item remaining">
                  <span>
                    Remaining
                  </span>

                  <strong>
                    Rs.{" "}
                    {formatMoney(
                      remainingBalance
                    )}
                  </strong>
                </div>

              </div>

              {/* =========================
                  FORM GRID
              ========================= */}

              <div className="payment-form-grid">

                {/* AMOUNT */}

                <div className="payment-form-group">
                  <label htmlFor="amount">
                    Amount Received
                  </label>

                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={
                      formData.amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter amount received"
                    min="0.01"
                    max={
                      remainingBalance
                    }
                    step="0.01"
                    autoFocus
                    required
                  />

                  <small>
                    Maximum: Rs.{" "}
                    {formatMoney(
                      remainingBalance
                    )}
                  </small>
                </div>

                {/* PAYMENT METHOD */}

                <div className="payment-form-group">
                  <label htmlFor="payment_method">
                    Payment Method
                  </label>

                  <select
                    id="payment_method"
                    name="payment_method"
                    value={
                      formData.payment_method
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="cash">
                      Cash
                    </option>

                    <option value="bank">
                      Bank Transfer
                    </option>

                    <option value="esewa">
                      eSewa
                    </option>

                    <option value="khalti">
                      Khalti
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                {/* NOTES */}

                <div className="payment-form-group full-width">
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
                    placeholder="Optional payment notes"
                    rows="3"
                  />
                </div>

              </div>

              {/* =========================
                  ACTIONS
              ========================= */}

              <div className="payment-form-actions">

                <button
                  type="button"
                  className="payment-cancel-button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="payment-save-button"
                  disabled={
                    submitting ||
                    paymentAmount <=
                      0 ||
                    paymentAmount >
                      remainingBalance
                  }
                >
                  {submitting
                    ? "Recording..."
                    : "Record Payment"}
                </button>

              </div>

            </form>
          </section>
        )}

      {/* =========================
          OUTSTANDING PAYMENTS
      ========================= */}

      <section className="payments-table-card">

        <div className="payments-table-heading">
          <div>
            <h2>
              Outstanding Payments
            </h2>

            <span>
              {
                outstandingDeliveries.length
              }{" "}
              outstanding
            </span>
          </div>
        </div>

        {outstandingDeliveries.length ===
        0 ? (
          <div className="payments-empty">
            No outstanding payments.
          </div>
        ) : (
          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Delivery
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Remaining
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {outstandingDeliveries.map(
                  (delivery) => (
                    <tr
                      key={
                        delivery.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            delivery.customer_name
                          }
                        </strong>
                      </td>

                      <td>
                        #
                        {
                          delivery.id
                        }
                      </td>

                      <td>
                        Rs.{" "}
                        {formatMoney(
                          delivery.total_amount
                        )}
                      </td>

                      <td>
                        Rs.{" "}
                        {formatMoney(
                          delivery.paid_amount
                        )}
                      </td>

                      <td>
                        <strong>
                          Rs.{" "}
                          {formatMoney(
                            delivery.remaining_balance
                          )}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="payment-save-button"
                          onClick={() =>
                            openPayment(
                              delivery
                            )
                          }
                        >
                          Record Payment
                        </button>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          </div>
        )}
      </section>

      {/* =========================
          PAYMENT HISTORY
      ========================= */}

      <section className="payments-table-card">

        <div className="payments-table-heading">
          <div>
            <h2>
              Payment History
            </h2>

            <span>
              {
                payments.length
              } payments
            </span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="payments-empty">
            No payments found.
          </div>
        ) : (
          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Delivery
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Method
                  </th>

                  <th>
                    Paid At
                  </th>

                  <th>
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>

                {payments.map(
                  (payment) => (
                    <tr
                      key={
                        payment.id
                      }
                    >

                      <td>
                        <strong>
                          {
                            payment.customer_name
                          }
                        </strong>
                      </td>

                      <td>
                        #
                        {
                          payment.delivery_id
                        }
                      </td>

                      <td>
                        <strong>
                          Rs.{" "}
                          {formatMoney(
                            payment.amount
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="payment-method">
                          {
                            payment.payment_method
                          }
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          payment.paid_at
                        )}
                      </td>

                      <td>
                        {
                          payment.notes ||
                          "—"
                        }
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

export default Payments;