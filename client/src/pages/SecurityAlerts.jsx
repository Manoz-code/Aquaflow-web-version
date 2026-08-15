import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

import {
  getSecurityAlerts,
  markSecurityAlertAsRead,
  markAllSecurityAlertsAsRead,
} from "../services/api";

import "./SecurityAlerts.css";

const SecurityAlerts = () => {
  // =========================
  // STATE
  // =========================

  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [markingRead, setMarkingRead] = useState(null);

  const [markingAllRead, setMarkingAllRead] =
    useState(false);

  // =========================
  // LOAD ALERTS
  // =========================

  const loadAlerts = async () => {
    try {
      setError("");

      const data = await getSecurityAlerts();

      setAlerts(data.alerts || []);
    } catch (error) {
      console.error(
        "Security alerts error:",
        error
      );

      setError(
        error.message ||
          "Failed to load security alerts"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // + AUTO REFRESH
  // =========================

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(() => {
      loadAlerts();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================
  // MARK ONE AS READ
  // =========================

  const handleMarkAsRead = async (id) => {
    try {
      setMarkingRead(id);
      setError("");

      await markSecurityAlertAsRead(id);

      // Update immediately in UI
      setAlerts((previous) =>
        previous.map((alert) =>
          alert.id === id
            ? {
                ...alert,
                is_read: true,
              }
            : alert
        )
      );
    } catch (error) {
      console.error(
        "Mark security alert as read error:",
        error
      );

      setError(
        error.message ||
          "Failed to mark security alert as read"
      );
    } finally {
      setMarkingRead(null);
    }
  };

  // =========================
  // MARK ALL AS READ
  // =========================

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      setError("");

      await markAllSecurityAlertsAsRead();

      // Update immediately in UI
      setAlerts((previous) =>
        previous.map((alert) => ({
          ...alert,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all security alerts error:",
        error
      );

      setError(
        error.message ||
          "Failed to mark all security alerts as read"
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-NP",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =========================
  // UNREAD COUNT
  // =========================

  const unreadCount = alerts.filter(
    (alert) => !alert.is_read
  ).length;

  // =========================
  // RENDER
  // =========================

  return (
    <DashboardLayout>

      <div className="security-alerts-page">

        {/* =========================
            HEADER
        ========================== */}

        <div className="security-alerts-header">

          <div>

            <h1>
              Security Alerts
            </h1>

            <p>
              Monitor important security
              events and suspicious activity.
            </p>

          </div>


          <div className="security-alert-header-actions">

            {/* UNREAD COUNT */}

            {unreadCount > 0 && (
              <span className="security-unread-count">

                {unreadCount} unread

              </span>
            )}


            {/* MARK ALL */}

            {unreadCount > 0 && (
              <button
                type="button"
                className="security-mark-all-button"
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead}
              >
                {markingAllRead
                  ? "Marking..."
                  : "Mark all as read"}
              </button>
            )}


            {/* REFRESH */}

            <button
              type="button"
              className="security-refresh-button"
              onClick={loadAlerts}
              disabled={loading}
            >
              ↻{" "}
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

        </div>


        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div className="security-alert-error">

            <strong>
              Error:
            </strong>{" "}

            {error}

          </div>
        )}


        {/* =========================
            LOADING
        ========================== */}

        {loading && (
          <div className="security-alerts-card">

            <div className="security-alert-icon">
              ⚠
            </div>

            <h2>
              Loading Security Alerts
            </h2>

            <p>
              Please wait while we load
              the security events.
            </p>

          </div>
        )}


        {/* =========================
            EMPTY
        ========================== */}

        {!loading &&
          !error &&
          alerts.length === 0 && (

            <div className="security-alerts-card">

              <div className="security-alert-icon">
                ✓
              </div>

              <h2>
                No Security Alerts
              </h2>

              <p>
                There are currently no
                security alerts to review.
              </p>

            </div>
          )}


        {/* =========================
            ALERTS
        ========================== */}

        {!loading &&
          !error &&
          alerts.length > 0 && (

            <>

              {/* WARNING */}

              {unreadCount > 0 && (
                <div className="security-alert-notice">

                  <span className="security-alert-notice-icon">
                    ⚠️
                  </span>

                  <div>

                    <strong>
                      New security activity
                    </strong>

                    <p>
                      You have{" "}
                      <strong>
                        {unreadCount}
                      </strong>{" "}
                      unread security alert
                      {unreadCount !== 1
                        ? "s"
                        : ""}.
                    </p>

                  </div>

                </div>
              )}


              {/* TABLE CARD */}

              <div className="security-alerts-table-card">

                {/* TABLE HEADER */}

                <div className="security-alerts-table-header">

                  <div>

                    <h2>
                      Security Events
                    </h2>

                    <p>
                      Recent security activity
                      in AquaFlow.
                    </p>

                  </div>

                  <span className="alert-count">

                    {alerts.length} alert
                    {alerts.length !== 1
                      ? "s"
                      : ""}

                  </span>

                </div>


                {/* TABLE */}

                <div className="security-alerts-table-wrapper">

                  <table className="security-alerts-table">

                    <thead>

                      <tr>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                        <th>
                          Description
                        </th>

                        <th>
                          User
                        </th>

                        <th>
                          IP Address
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

                      {alerts.map(
                        (alert) => (

                          <tr
                            key={alert.id}
                            className={
                              !alert.is_read
                                ? "security-alert-unread"
                                : ""
                            }
                          >

                            {/* STATUS */}

                            <td>

                              {!alert.is_read ? (

                                <span className="security-unread-badge">
                                  New
                                </span>

                              ) : (

                                <span className="security-read-badge">
                                  Read
                                </span>

                              )}

                            </td>


                            {/* ACTION */}

                            <td>

                              <span className="security-action">

                                {alert.action}

                              </span>

                            </td>


                            {/* DESCRIPTION */}

                            <td>

                              {alert.description}

                            </td>


                            {/* USER */}

                            <td>

                              {alert.user_name ||
                                "System"}

                            </td>


                            {/* IP */}

                            <td>

                              {alert.ip_address ||
                                "-"}

                            </td>


                            {/* DATE */}

                            <td>

                              {formatDate(
                                alert.created_at
                              )}

                            </td>


                            {/* ACTION BUTTON */}

                            <td>

                              {!alert.is_read ? (

                                <button
                                  type="button"
                                  className="security-mark-read-button"
                                  onClick={() =>
                                    handleMarkAsRead(
                                      alert.id
                                    )
                                  }
                                  disabled={
                                    markingRead ===
                                    alert.id
                                  }
                                >

                                  {markingRead ===
                                  alert.id
                                    ? "Saving..."
                                    : "Mark as read"}

                                </button>

                              ) : (

                                <span className="security-read-text">
                                  ✓ Read
                                </span>

                              )}

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </>
          )}

      </div>

    </DashboardLayout>
  );
};

export default SecurityAlerts;