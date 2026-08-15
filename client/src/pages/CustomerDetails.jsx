
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCustomerById,
  getCustomerSummary,
} from "../services/api";

import "./CustomerDetails.css";


const CustomerDetails = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState(null);

  const [summary, setSummary] =
    useState(null);

  const [deliveries, setDeliveries] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // LOAD CUSTOMER
  // =========================

  useEffect(() => {

    const loadCustomer =
      async () => {

        try {

          setLoading(true);
          setError("");

          const [
            customerData,
            summaryData,
          ] = await Promise.all([

            getCustomerById(id),

            getCustomerSummary(id),

          ]);


          setCustomer(
            customerData.customer
          );

          setSummary(
            summaryData.summary
          );

          setDeliveries(
            summaryData.deliveries || []
          );

          setPayments(
            summaryData.payments || []
          );

        } catch (error) {

          console.error(
            "Customer details error:",
            error
          );

          setError(
            error.message ||
              "Failed to load customer details"
          );

        } finally {

          setLoading(false);

        }
      };


    loadCustomer();

  }, [id]);


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="customer-details-page">

        <div className="customer-details-loading">

          Loading customer details...

        </div>

      </div>

    );
  }


  // =========================
  // ERROR
  // =========================

  if (error) {

    return (

      <div className="customer-details-page">

        <button
          className="back-button"
          onClick={() =>
            navigate("/customers")
          }
        >
          ← Back to Customers
        </button>


        <div className="customer-details-error">

          {error}

        </div>

      </div>

    );
  }


  return (

    <div className="customer-details-page">

      {/* =========================
          HEADER
      ========================== */}

      <section className="customer-details-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/customers")
            }
          >
            ← Back to Customers
          </button>


          <h1>
            {customer.name}
          </h1>


          <p>
            Customer details and
            account history
          </p>

        </div>


        <span
          className={`customer-status ${
            customer.status
          }`}
        >
          {customer.status}
        </span>

      </section>


      {/* =========================
          CUSTOMER INFORMATION
      ========================== */}

      <section className="customer-details-card">

        <h2>
          Customer Information
        </h2>


        <div className="customer-info-grid">

          <div>

            <span>
              Name
            </span>

            <strong>
              {customer.name}
            </strong>

          </div>


          <div>

            <span>
              Phone
            </span>

            <strong>
              {customer.phone}
            </strong>

          </div>


          <div>

            <span>
              Address
            </span>

            <strong>
              {customer.address}
            </strong>

          </div>


          <div>

            <span>
              Customer Since
            </span>

            <strong>

              {new Date(
                customer.created_at
              ).toLocaleDateString()}

            </strong>

          </div>

        </div>

      </section>


      {/* =========================
          ACCOUNT SUMMARY
      ========================== */}

      <section className="customer-details-card">

        <h2>
          Account Summary
        </h2>


        <div className="customer-summary-grid">

          <div className="summary-box">

            <span>
              Total Deliveries
            </span>

            <strong>
              {summary?.total_deliveries || 0}
            </strong>

          </div>


          <div className="summary-box">

            <span>
              Total Liters
            </span>

            <strong>
              {summary?.total_liters || 0} L
            </strong>

          </div>


          <div className="summary-box">

            <span>
              Total Billed
            </span>

            <strong>
              Rs. {summary?.total_billed || 0}
            </strong>

          </div>


          <div className="summary-box">

            <span>
              Total Paid
            </span>

            <strong>
              Rs. {summary?.total_paid || 0}
            </strong>

          </div>


          <div className="summary-box outstanding">

            <span>
              Outstanding
            </span>

            <strong>
              Rs. {summary?.outstanding || 0}
            </strong>

          </div>

        </div>

      </section>


      {/* =========================
          DELIVERY HISTORY
      ========================== */}

      <section className="customer-details-card">

        <div className="details-section-heading">

          <h2>
            Delivery History
          </h2>

          <span>
            {deliveries.length} deliveries
          </span>

        </div>


        {deliveries.length === 0 ? (

          <div className="details-empty">

            No deliveries found.

          </div>

        ) : (

          <div className="details-table-wrapper">

            <table className="details-table">

              <thead>

                <tr>

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
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Delivered
                  </th>

                </tr>

              </thead>


              <tbody>

                {deliveries.map(
                  (delivery) => (

                    <tr
                      key={delivery.id}
                    >

                      <td>
                        {
                          delivery.driver_name ||
                          "—"
                        }
                      </td>


                      <td>
                        {
                          delivery.quantity_liters
                        } L
                      </td>


                      <td>
                        Rs.{" "}
                        {
                          delivery.price_per_liter
                        }
                      </td>


                      <td>
                        Rs.{" "}
                        {
                          delivery.total_amount
                        }
                      </td>


                      <td>

                        <span
                          className={`customer-status ${
                            delivery.delivery_status
                          }`}
                        >
                          {
                            delivery.delivery_status
                          }
                        </span>

                      </td>


                      <td>

                        {delivery.delivered_at
                          ? new Date(
                              delivery.delivered_at
                            ).toLocaleDateString()
                          : "—"}

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
      ========================== */}

      <section className="customer-details-card">

        <div className="details-section-heading">

          <h2>
            Payment History
          </h2>

          <span>
            {payments.length} payments
          </span>

        </div>


        {payments.length === 0 ? (

          <div className="details-empty">

            No payments found.

          </div>

        ) : (

          <div className="details-table-wrapper">

            <table className="details-table">

              <thead>

                <tr>

                  <th>
                    Amount
                  </th>

                  <th>
                    Payment Method
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
                      key={payment.id}
                    >

                      <td>
                        Rs.{" "}
                        {payment.amount}
                      </td>


                      <td>
                        {
                          payment.payment_method
                        }
                      </td>


                      <td>

                        {payment.paid_at
                          ? new Date(
                              payment.paid_at
                            ).toLocaleDateString()
                          : "—"}

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


export default CustomerDetails;

