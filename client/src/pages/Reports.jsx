
import { useEffect, useState } from "react";
import "./Reports.css";
import { getReportSummary } from "../services/api";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Currently applied dates
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  // =========================
  // LOAD REPORT
  // =========================

  const loadReport = async (from = "", to = "") => {
    try {
      setLoading(true);
      setError("");

      const data = await getReportSummary(from, to);

      setReport(data.summary);
    } catch (error) {
      console.error("Reports page error:", error);

      setError(
        error.message || "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadReport();
  }, []);

  // =========================
  // APPLY FILTER
  // =========================

  const handleApplyFilter = () => {
    setError("");

    // Both dates are required
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      setError(
        "Please select both From Date and To Date."
      );
      return;
    }

    // Validate date order
    if (fromDate && toDate && fromDate > toDate) {
      setError(
        "From Date cannot be after To Date."
      );
      return;
    }

    setAppliedFrom(fromDate);
    setAppliedTo(toDate);

    loadReport(fromDate, toDate);
  };

  // =========================
  // CLEAR FILTER
  // =========================

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    setError("");

    loadReport();
  };

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = () => {
    loadReport(appliedFrom, appliedTo);
  };

  // =========================
  // FORMAT MONEY
  // =========================

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-NP",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================
  // FORMAT NUMBER
  // =========================

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString(
      "en-NP"
    );
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="reports-page">

      {/* =========================
          HEADER
      ========================== */}

      <section className="reports-header">

        <div>
          <h1>Reports</h1>

          <p>
            View your water supply business summary.
          </p>
        </div>

        <button
          type="button"
          className="refresh-report-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          ↻ {loading ? "Loading..." : "Refresh"}
        </button>

      </section>


      {/* =========================
          DATE FILTER
      ========================== */}

      <section className="reports-filter-card">

        <div className="reports-filter-heading">

          <div>
            <h2>Filter Report</h2>

            <span>
              Select a date range to view a specific
              period.
            </span>
          </div>

        </div>


        <div className="reports-filter-controls">

          {/* FROM DATE */}

          <div className="report-date-group">

            <label htmlFor="from-date">
              From Date
            </label>

            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />

          </div>


          {/* TO DATE */}

          <div className="report-date-group">

            <label htmlFor="to-date">
              To Date
            </label>

            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />

          </div>


          {/* ACTIONS */}

          <div className="report-filter-actions">

            <button
              type="button"
              className="apply-report-button"
              onClick={handleApplyFilter}
              disabled={loading}
            >
              Apply Filter
            </button>

            <button
              type="button"
              className="clear-report-button"
              onClick={handleClearFilter}
              disabled={loading}
            >
              Clear
            </button>

          </div>

        </div>


        {/* ACTIVE FILTER */}

        {appliedFrom && appliedTo && (
          <div className="active-report-filter">

            Showing report from{" "}

            <strong>
              {formatDate(appliedFrom)}
            </strong>

            {" "}to{" "}

            <strong>
              {formatDate(appliedTo)}
            </strong>

          </div>
        )}

      </section>


      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}


      {/* =========================
          LOADING
      ========================== */}

      {loading && (
        <div className="reports-empty">
          Loading reports...
        </div>
      )}


      {/* =========================
          SUMMARY
      ========================== */}

      {!loading && report && (

        <section className="reports-summary-grid">

          {/* CUSTOMERS */}

          <div className="report-card">

            <span className="report-card-label">
              Total Customers
            </span>

            <strong>
              {formatNumber(
                report.total_customers
              )}
            </strong>

            <small>
              Registered customers
            </small>

          </div>


          {/* DELIVERIES */}

          <div className="report-card">

            <span className="report-card-label">
              Total Deliveries
            </span>

            <strong>
              {formatNumber(
                report.total_deliveries
              )}
            </strong>

            <small>
              Water deliveries
            </small>

          </div>


          {/* LITERS */}

          <div className="report-card">

            <span className="report-card-label">
              Total Liters
            </span>

            <strong>
              {formatNumber(
                report.total_liters
              )}
            </strong>

            <small>
              Liters delivered
            </small>

          </div>


          {/* BILLED */}

          <div className="report-card">

            <span className="report-card-label">
              Total Billed
            </span>

            <strong>
              Rs.{" "}
              {formatMoney(
                report.total_billed
              )}
            </strong>

            <small>
              Total delivery value
            </small>

          </div>


          {/* PAID */}

          <div className="report-card paid">

            <span className="report-card-label">
              Total Paid
            </span>

            <strong>
              Rs.{" "}
              {formatMoney(
                report.total_paid
              )}
            </strong>

            <small>
              Payments received
            </small>

          </div>


          {/* OUTSTANDING */}

          <div className="report-card outstanding">

            <span className="report-card-label">
              Outstanding
            </span>

            <strong>
              Rs.{" "}
              {formatMoney(
                report.outstanding
              )}
            </strong>

            <small>
              Remaining customer balance
            </small>

          </div>

        </section>
      )}


      {/* =========================
          FINANCIAL OVERVIEW
      ========================== */}

      {!loading && (

        <section className="reports-table-card">

          <div className="reports-table-heading">

            <div>

              <h2>
                Financial Overview
              </h2>

              <span>
                {appliedFrom && appliedTo
                  ? `Report for ${formatDate(
                      appliedFrom
                    )} - ${formatDate(
                      appliedTo
                    )}`
                  : "Current business totals"}
              </span>

            </div>

          </div>


          {report && (

            <div className="reports-overview">

              {/* TOTAL BILLED */}

              <div className="overview-row">

                <span>
                  Total Billed
                </span>

                <strong>
                  Rs.{" "}
                  {formatMoney(
                    report.total_billed
                  )}
                </strong>

              </div>


              {/* TOTAL PAID */}

              <div className="overview-row">

                <span>
                  Total Paid
                </span>

                <strong className="paid-text">
                  Rs.{" "}
                  {formatMoney(
                    report.total_paid
                  )}
                </strong>

              </div>


              {/* OUTSTANDING */}

              <div className="overview-row">

                <span>
                  Outstanding Balance
                </span>

                <strong className="outstanding-text">
                  Rs.{" "}
                  {formatMoney(
                    report.outstanding
                  )}
                </strong>

              </div>

            </div>

          )}

        </section>

      )}

    </div>
  );
};

export default Reports;

