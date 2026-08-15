import { useEffect, useState } from "react";
import "./Drivers.css";

import {
  getDrivers,
  createDriver,
  updateDriver,
  deactivateDriver,
  reactivateDriver,
  getUsers,
} from "../services/api";

const Drivers = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [selectedUser, setSelectedUser] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [updatingDriver, setUpdatingDriver] = useState(null);

  // =====================================================
  // LOAD DRIVERS + USERS
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [driverData, userData] = await Promise.all([
        getDrivers(),
        getUsers(),
      ]);

      setDrivers(driverData?.drivers || []);
      setUsers(userData?.users || []);
    } catch (error) {
      console.error("Load drivers error:", error);

      setError(
        error.message || "Failed to load drivers"
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
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingDriver(null);
    setSelectedUser("");
    setError("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (driver) => {
    setEditingDriver(driver);

    setSelectedUser(
      driver.user_id
        ? String(driver.user_id)
        : ""
    );

    setError("");
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
    setEditingDriver(null);
    setSelectedUser("");
  };

  // =====================================================
  // CREATE / UPDATE DRIVER
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      // =================================================
      // VALIDATE USER
      // =================================================

      if (!selectedUser) {
        setError("Please select a user");
        return;
      }

      // =================================================
      // CREATE DRIVER
      // =================================================

      if (!editingDriver) {
        await createDriver(
          Number(selectedUser)
        );
      }

      // =================================================
      // UPDATE DRIVER
      // =================================================

      else {
        const selectedUserData = users.find(
          (user) =>
            Number(user.id) ===
            Number(selectedUser)
        );

        if (!selectedUserData) {
          setError("Selected user not found");
          return;
        }

        await updateDriver(
          editingDriver.id,
          Number(selectedUser)
        );
      }

      // =================================================
      // RELOAD DATA
      // =================================================

      await loadData();

      // =================================================
      // CLOSE FORM
      // =================================================

      setShowForm(false);
      setEditingDriver(null);
      setSelectedUser("");

    } catch (error) {
      console.error(
        "Save driver error:",
        error
      );

      setError(
        error.message ||
          "Failed to save driver"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DEACTIVATE DRIVER
  // =====================================================

  const handleDeactivate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this driver?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingDriver(id);
      setError("");

      await deactivateDriver(id);

      setDrivers((previous) =>
        previous.map((driver) =>
          driver.id === id
            ? {
                ...driver,
                status: "inactive",
              }
            : driver
        )
      );
    } catch (error) {
      console.error(
        "Deactivate driver error:",
        error
      );

      setError(
        error.message ||
          "Failed to deactivate driver"
      );
    } finally {
      setUpdatingDriver(null);
    }
  };

  // =====================================================
  // REACTIVATE DRIVER
  // =====================================================

  const handleReactivate = async (id) => {
    try {
      setUpdatingDriver(id);
      setError("");

      await reactivateDriver(id);

      setDrivers((previous) =>
        previous.map((driver) =>
          driver.id === id
            ? {
                ...driver,
                status: "active",
              }
            : driver
        )
      );
    } catch (error) {
      console.error(
        "Reactivate driver error:",
        error
      );

      setError(
        error.message ||
          "Failed to reactivate driver"
      );
    } finally {
      setUpdatingDriver(null);
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    return status === "active"
      ? "driver-status active"
      : "driver-status inactive";
  };

  // =====================================================
  // STATUS TEXT
  // =====================================================

  const getStatusText = (status) => {
    return status === "active"
      ? "Active"
      : "Inactive";
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // AVAILABLE USERS
  // =====================================================

  const availableUsers = users.filter(
    (user) => {
      // Check whether this user is already
      // assigned to another driver
      const alreadyDriver = drivers.some(
        (driver) =>
          Number(driver.user_id) ===
          Number(user.id)
      );

      // While editing, allow the current
      // driver's existing user
      const isCurrentDriverUser =
        editingDriver &&
        Number(editingDriver.user_id) ===
          Number(user.id);

      return (
        user.status === "active" &&
        (
          !alreadyDriver ||
          isCurrentDriverUser
        )
      );
    }
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div>

        <section className="drivers-header">

          <div>

            <h1>
              Drivers
            </h1>

            <p>
              Manage your delivery drivers.
            </p>

          </div>

        </section>

        <div className="drivers-empty">
          Loading drivers...
        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="drivers-header">

        <div>

          <h1>
            Drivers
          </h1>

          <p>
            Manage your delivery drivers.
          </p>

        </div>

        <button
          type="button"
          className="add-driver-button"
          onClick={openAddForm}
        >
          + Add Driver
        </button>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="drivers-error">

          <strong>
            Notice:
          </strong>{" "}

          {error}

        </div>
      )}


      {/* =================================================
          FORM
      ================================================= */}

      {showForm && (

        <section className="driver-form-card">

          {/* FORM HEADING */}

          <div className="driver-form-heading">

            <div>

              <h2>
                {editingDriver
                  ? "Edit Driver"
                  : "Add Driver"}
              </h2>

              <p>
                {editingDriver
                  ? "Update the driver user."
                  : "Select an existing user to make them a driver."}
              </p>

            </div>

            <button
              type="button"
              className="close-driver-form"
              onClick={closeForm}
              disabled={submitting}
            >
              ×
            </button>

          </div>


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            <div className="driver-form-grid">

              {/* =================================================
                  SELECT USER
              ================================================= */}

              <div className="driver-form-group full-width">

                <label htmlFor="driver-user">
                  Select User
                </label>

                <select
                  id="driver-user"
                  value={selectedUser}
                  onChange={(event) =>
                    setSelectedUser(
                      event.target.value
                    )
                  }
                  required
                  disabled={
                    submitting ||
                    availableUsers.length === 0
                  }
                >

                  <option value="">
                    {availableUsers.length === 0
                      ? "No available users"
                      : "Select an active user"}
                  </option>

                  {availableUsers.map(
                    (user) => (

                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {user.name} —{" "}
                        {user.phone ||
                          "No phone"}{" "}
                        ({user.role})
                      </option>

                    )
                  )}

                </select>


                {availableUsers.length === 0 && (

                  <small>
                    All active users are
                    already drivers.
                  </small>

                )}

              </div>


              {/* =================================================
                  SELECTED USER PREVIEW
              ================================================= */}

              {selectedUser && (

                <div className="driver-selected-user">

                  {(() => {

                    const user =
                      users.find(
                        (item) =>
                          Number(item.id) ===
                          Number(selectedUser)
                      );

                    if (!user) {
                      return null;
                    }

                    return (
                      <>

                        <strong>
                          {user.name}
                        </strong>

                        <span>
                          {user.phone ||
                            "No phone number"}
                        </span>

                        <span>
                          Role: {user.role}
                        </span>

                      </>
                    );

                  })()}

                </div>

              )}

            </div>


            {/* =================================================
                FORM ACTIONS
            ================================================= */}

            <div className="driver-form-actions">

              <button
                type="button"
                className="driver-cancel-button"
                onClick={closeForm}
                disabled={submitting}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="driver-save-button"
                disabled={
                  submitting ||
                  !selectedUser
                }
              >

                {submitting
                  ? "Saving..."
                  : editingDriver
                  ? "Update Driver"
                  : "Create Driver"}

              </button>

            </div>

          </form>

        </section>

      )}


      {/* =================================================
          DRIVER TABLE
      ================================================= */}

      <section className="drivers-table-card">

        {/* TABLE HEADING */}

        <div className="drivers-table-heading">

          <div>

            <h2>
              All Drivers
            </h2>

            <span>
              {drivers.length} drivers
            </span>

          </div>

        </div>


        {/* NO DRIVERS */}

        {drivers.length === 0 ? (

          <div className="drivers-empty">
            No drivers found.
          </div>

        ) : (

          <div className="drivers-table-wrapper">

            <table className="drivers-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {drivers.map(
                  (driver) => (

                    <tr
                      key={driver.id}
                    >

                      {/* NAME */}

                      <td>

                        <strong>
                          {driver.name}
                        </strong>

                      </td>


                      {/* PHONE */}

                      <td>
                        {driver.phone ||
                          "—"}
                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={getStatusClass(
                            driver.status
                          )}
                        >
                          {getStatusText(
                            driver.status
                          )}
                        </span>

                      </td>


                      {/* JOINED */}

                      <td>
                        {formatDate(
                          driver.created_at
                        )}
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="driver-actions">

                          {/* EDIT */}

                          <button
                            type="button"
                            className="driver-edit-button"
                            onClick={() =>
                              openEditForm(
                                driver
                              )
                            }
                            disabled={
                              updatingDriver ===
                              driver.id
                            }
                          >
                            Edit
                          </button>


                          {/* DEACTIVATE / REACTIVATE */}

                          {driver.status ===
                          "active" ? (

                            <button
                              type="button"
                              className="driver-deactivate-button"
                              onClick={() =>
                                handleDeactivate(
                                  driver.id
                                )
                              }
                              disabled={
                                updatingDriver ===
                                driver.id
                              }
                            >

                              {updatingDriver ===
                              driver.id
                                ? "Updating..."
                                : "Deactivate"}

                            </button>

                          ) : (

                            <button
                              type="button"
                              className="driver-reactivate-button"
                              onClick={() =>
                                handleReactivate(
                                  driver.id
                                )
                              }
                              disabled={
                                updatingDriver ===
                                driver.id
                              }
                            >

                              {updatingDriver ===
                              driver.id
                                ? "Updating..."
                                : "Reactivate"}

                            </button>

                          )}

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

export default Drivers;