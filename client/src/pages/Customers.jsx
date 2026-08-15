
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "./Customers.css";

import {
  getCustomers,
  createCustomer,
  deleteCustomer,
} from "../services/api";

const Customers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  // =========================
  // LOAD CUSTOMERS
  // =========================

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers();

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Customers error:", error);

      setError(
        error.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================
  // FORM INPUT
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
  // CREATE CUSTOMER
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const data = await createCustomer(
        formData.name,
        formData.phone,
        formData.address
      );

      setCustomers((previous) => [
        data.customer,
        ...previous,
      ]);

      setFormData({
        name: "",
        phone: "",
        address: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error(
        "Create customer error:",
        error
      );

      setError(
        error.message ||
          "Failed to create customer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE CUSTOMER
  // ADMIN ONLY
  // =========================

  const handleDeleteCustomer = async (
    id,
    name
  ) => {
    if (user?.role !== "admin") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteCustomer(id);

      setCustomers((previous) =>
        previous.filter(
          (customer) =>
            customer.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete customer error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete customer"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="customers-page">

        <section className="customers-header">

          <div>
            <h1>
              Customers
            </h1>

            <p>
              Manage your water supply
              customers.
            </p>
          </div>

        </section>

        <div className="customers-empty">
          Loading customers...
        </div>

      </div>
    );
  }

  return (
    <div className="customers-page">

      {/* =========================
          HEADER
      ========================== */}

      <section className="customers-header">

        <div>
          <h1>
            Customers
          </h1>

          <p>
            Manage your water supply
            customers.
          </p>
        </div>

        <button
          className="add-customer-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          + Add Customer
        </button>

      </section>


      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="customers-error">
          {error}
        </div>
      )}


      {/* =========================
          ADD CUSTOMER FORM
      ========================== */}

      {showForm && (
        <section className="customer-form-card">

          <div className="form-heading">

            <div>
              <h2>
                Add Customer
              </h2>

              <p>
                Enter the customer's
                information.
              </p>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={() =>
                setShowForm(false)
              }
            >
              ×
            </button>

          </div>


          <form
            onSubmit={handleSubmit}
          >

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Customer name"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Customer address"
                  required
                />

              </div>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="save-button"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : "Save Customer"}
              </button>

            </div>

          </form>

        </section>
      )}


      {/* =========================
          CUSTOMER TABLE
      ========================== */}

      <section className="customers-table-card">

        <div className="table-heading">

          <div>

            <h2>
              All Customers
            </h2>

            <span>
              {customers.length} customers
            </span>

          </div>

        </div>


        {customers.length === 0 ? (

          <div className="customers-empty">
            No customers found.
          </div>

        ) : (

          <div className="customers-table-wrapper">

            <table className="customers-table">

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Address
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {customers.map(
                  (customer) => (

                    <tr
                      key={customer.id}
                    >

                      <td>
                        <strong>
                          {customer.name}
                        </strong>
                      </td>


                      <td>
                        {customer.phone}
                      </td>


                      <td>
                        {customer.address}
                      </td>


                      <td>

                        <span
                          className={`customer-status ${
                            customer.status
                          }`}
                        >
                          {customer.status}
                        </span>

                      </td>


                      <td>

                        <div className="customer-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="view-customer-button"
                            onClick={() =>
                              navigate(
                                `/customers/${customer.id}`
                              )
                            }
                          >
                            View
                          </button>


                          {/* DELETE - ADMIN ONLY */}

                          {user?.role ===
                            "admin" && (
                            <button
                              type="button"
                              className="delete-customer-button"
                              disabled={
                                deletingId ===
                                customer.id
                              }
                              onClick={() =>
                                handleDeleteCustomer(
                                  customer.id,
                                  customer.name
                                )
                              }
                            >
                              {deletingId ===
                              customer.id
                                ? "Deleting..."
                                : "Delete"}
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

export default Customers;
