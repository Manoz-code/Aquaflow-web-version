
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  getReportSummary,
  getDeliveries,
} from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [summaryData, deliveryData] =
          await Promise.all([
            getReportSummary(),
            getDeliveries(),
          ]);

        setSummary(summaryData?.summary || {});
        setDeliveries(deliveryData?.deliveries || []);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-loading">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <DashboardLayout>
        <div className="dashboard-error">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <DashboardLayout>
      <div className="admin-dashboard">

        {/* =========================
            HEADER
        ========================== */}

        <div className="dashboard-heading">

          <div>
            <h2>Overview</h2>

            <p>
              Here's what's happening with your
              water supply business.
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>

        </div>


        {/* =========================
            STAT CARDS
        ========================== */}

        <div className="stats-grid">

          {/* CUSTOMERS */}

          <div className="stat-card">

            <div className="stat-icon customers-icon">
              👥
            </div>

            <div>
              <p>Total Customers</p>

              <h3>
                {Number(
                  summary.total_customers || 0
                ).toLocaleString()}
              </h3>
            </div>

          </div>


          {/* DELIVERIES */}

          <div className="stat-card">

            <div className="stat-icon delivery-icon">
              🚚
            </div>

            <div>
              <p>Total Deliveries</p>

              <h3>
                {Number(
                  summary.total_deliveries || 0
                ).toLocaleString()}
              </h3>
            </div>

          </div>


          {/* WATER */}

          <div className="stat-card">

            <div className="stat-icon water-icon">
              💧
            </div>

            <div>
              <p>Water Delivered</p>

              <h3>
                {Number(
                  summary.total_liters || 0
                ).toLocaleString()}{" "}
                L
              </h3>
            </div>

          </div>


          {/* CUSTOMERS SERVED */}

          <div className="stat-card">

            <div className="stat-icon served-icon">
              ✓
            </div>

            <div>
              <p>Customers Served</p>

              <h3>
                {Number(
                  summary.customers_served || 0
                ).toLocaleString()}
              </h3>
            </div>

          </div>

        </div>


        {/* =========================
            FINANCE CARDS
        ========================== */}

        <div className="finance-grid">

          {/* TOTAL BILLED */}

          <div className="finance-card">

            <p>Total Billed</p>

            <h3>
              Rs.{" "}
              {Number(
                summary.total_billed || 0
              ).toLocaleString()}
            </h3>

          </div>


          {/* TOTAL PAID */}

          <div className="finance-card">

            <p>Total Paid</p>

            <h3>
              Rs.{" "}
              {Number(
                summary.total_paid || 0
              ).toLocaleString()}
            </h3>

          </div>


          {/* OUTSTANDING */}

          <div className="finance-card outstanding-card">

            <p>Outstanding</p>

            <h3>
              Rs.{" "}
              {Number(
                summary.outstanding || 0
              ).toLocaleString()}
            </h3>

            <span>
              Amount yet to be collected
            </span>

          </div>

        </div>


        {/* =========================
            OVERVIEW PANELS
        ========================== */}

        <div className="dashboard-panels">

          {/* DELIVERY OVERVIEW */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <h3>
                Delivery Overview
              </h3>

              <span>
                All time
              </span>

            </div>


            <div className="delivery-overview">

              <div>

                <strong>
                  {Number(
                    summary.total_deliveries || 0
                  ).toLocaleString()}
                </strong>

                <span>
                  Deliveries
                </span>

              </div>


              <div>

                <strong>
                  {Number(
                    summary.total_liters || 0
                  ).toLocaleString()}{" "}
                  L
                </strong>

                <span>
                  Water supplied
                </span>

              </div>


              <div>

                <strong>
                  {Number(
                    summary.customers_served || 0
                  ).toLocaleString()}
                </strong>

                <span>
                  Customers served
                </span>

              </div>

            </div>

          </div>


          {/* PAYMENT OVERVIEW */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <h3>
                Payment Overview
              </h3>

              <span>
                All time
              </span>

            </div>


            <div className="payment-overview">

              <div className="payment-row">

                <span>
                  Total billed
                </span>

                <strong>
                  Rs.{" "}
                  {Number(
                    summary.total_billed || 0
                  ).toLocaleString()}
                </strong>

              </div>


              <div className="payment-row">

                <span>
                  Total paid
                </span>

                <strong>
                  Rs.{" "}
                  {Number(
                    summary.total_paid || 0
                  ).toLocaleString()}
                </strong>

              </div>


              <div className="payment-row outstanding-row">

                <span>
                  Outstanding
                </span>

                <strong>
                  Rs.{" "}
                  {Number(
                    summary.outstanding || 0
                  ).toLocaleString()}
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            RECENT DELIVERIES
        ========================== */}

        <div className="recent-deliveries">

          <div className="panel-header">

            <div>

              <h3>
                Recent Deliveries
              </h3>

              <p>
                Latest water deliveries
              </p>

            </div>

          </div>


          {deliveries.length === 0 ? (

            <div className="empty-deliveries">
              No deliveries found.
            </div>

          ) : (

            <div className="delivery-table-wrapper">

              <table className="delivery-table">

                <thead>

                  <tr>
                    <th>Customer</th>
                    <th>Driver</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>

                </thead>


                <tbody>

                  {deliveries
                    .slice(0, 5)
                    .map((delivery) => (

                      <tr key={delivery.id}>

                        {/* CUSTOMER */}

                        <td>
                          <strong>
                            {delivery.customer_name ||
                              "Unknown"}
                          </strong>
                        </td>


                        {/* DRIVER */}

                        <td>
                          {delivery.driver_name ||
                            "Not assigned"}
                        </td>


                        {/* QUANTITY */}

                        <td>
                          {Number(
                            delivery.quantity_liters || 0
                          ).toLocaleString()}{" "}
                          L
                        </td>


                        {/* AMOUNT */}

                        <td>
                          Rs.{" "}
                          {Number(
                            delivery.total_amount || 0
                          ).toLocaleString()}
                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`delivery-status ${
                              delivery.delivery_status || ""
                            }`}
                          >
                            {delivery.delivery_status ||
                              "Unknown"}
                          </span>

                        </td>


                        {/* DATE */}

                        <td>
                          {delivery.created_at
                            ? new Date(
                                delivery.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
