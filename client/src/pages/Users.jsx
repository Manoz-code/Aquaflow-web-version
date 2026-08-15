import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  getUsers,
  updateUserStatus,
  registerStaff,
  deleteUser,
} from "../services/api";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Add staff states
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);
  const [staffError, setStaffError] = useState("");
  

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data.users);
    } catch (error) {
      console.error("Users error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (
    id,
    currentStatus
  ) => {
    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";

    try {
      setUpdatingId(id);

      const data = await updateUserStatus(
        id,
        newStatus
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id ? data.user : user
        )
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
  const confirmed = window.confirm(
    `Are you sure you want to permanently delete ${user.name}?`
  );

  if (!confirmed) return;

  try {
    setDeletingId(user.id);

    await deleteUser(user.id);

    setUsers((currentUsers) =>
      currentUsers.filter(
        (currentUser) => currentUser.id !== user.id
      )
    );
  } catch (error) {
    console.error("Delete user error:", error);
    alert(error.message);
  } finally {
    setDeletingId(null);
  }
};

  const handleAddStaff = async (e) => {
    e.preventDefault();

    setStaffError("");

    if (!staffName.trim()) {
      setStaffError("Name is required");
      return;
    }

    if (!staffPhone.trim()) {
      setStaffError("Phone number is required");
      return;
    }

    if (staffPassword.length < 6) {
      setStaffError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setAddingStaff(true);

      const data = await registerStaff(
        staffName.trim(),
        staffPhone.trim(),
        staffPassword
      );

      setUsers((currentUsers) => [
        data.user,
        ...currentUsers,
      ]);

      setStaffName("");
      setStaffPhone("");
      setStaffPassword("");

      setShowAddStaff(false);
    } catch (error) {
      console.error(
        "Add staff error:",
        error
      );

      setStaffError(error.message);
    } finally {
      setAddingStaff(false);
    }
  };

  const closeAddStaff = () => {
    if (addingStaff) return;

    setShowAddStaff(false);
    setStaffName("");
    setStaffPhone("");
    setStaffPassword("");
    setStaffError("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="users-state">
          Loading users...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="users-state users-error">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="users-heading">

        <div>
          <h2>Users & Staff</h2>

          <p>
            Manage AquaFlow users and staff accounts.
          </p>
        </div>

        <div className="users-heading-actions">

          <button
            className="refresh-users"
            onClick={loadUsers}
          >
            Refresh
          </button>

          <button
            className="add-staff-button"
            onClick={() => {
              setStaffError("");
              setShowAddStaff(true);
            }}
          >
            + Add Staff
          </button>

        </div>

      </div>


      {/* USERS TABLE */}

      <div className="users-card">

        <div className="users-card-header">

          <div>
            <h3>All Users</h3>

            <span>
              {users.length} user
              {users.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

        </div>


        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>

            </thead>

<tbody>
  {users.map((user) => (
    <tr key={user.id}>

      {/* USER */}
      <td>
        <div className="user-cell">

          <div className="user-table-avatar">
            {user.profile_image ? (
              <img
                src={`http://localhost:3000${user.profile_image}`}
                alt={user.name}
              />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>

          <div className="user-name">
            <strong>{user.name}</strong>

            <span>
              ID #{user.id}
            </span>
          </div>

        </div>
      </td>

      {/* PHONE */}
      <td>
        {user.phone}
      </td>

      {/* ROLE */}
      <td>
        <span className={`role-badge ${user.role}`}>
          {user.role === "admin"
            ? "Administrator"
            : "Staff"}
        </span>
      </td>

      {/* STATUS */}
      <td>
        <span className={`status-badge ${user.status}`}>
          {user.status === "active"
            ? "Active"
            : "Inactive"}
        </span>
      </td>

      {/* JOINED */}
      <td>
        {new Date(user.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        )}
      </td>

      {/* ACTION */}
      <td>
        {user.role === "admin" ? (

          <span className="admin-label">
            Admin
          </span>

        ) : (

          <div className="user-actions">

            <button
              className={
                user.status === "active"
                  ? "status-button deactivate"
                  : "status-button activate"
              }
              disabled={
                updatingId === user.id ||
                deletingId === user.id
              }
              onClick={() =>
                handleStatusChange(
                  user.id,
                  user.status
                )
              }
            >
              {updatingId === user.id
                ? "Updating..."
                : user.status === "active"
                ? "Deactivate"
                : "Activate"}
            </button>

            <button
              className="delete-user-button"
              disabled={deletingId === user.id}
              onClick={() =>
                handleDeleteUser(user)
              }
            >
              {deletingId === user.id
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>

        )}
      </td>

    </tr>
  ))}
</tbody>

          </table>

        </div>

      </div>


      {/* ADD STAFF MODAL */}

      {showAddStaff && (

        <div
          className="modal-overlay"
          onClick={closeAddStaff}
        >

          <div
            className="add-staff-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h3>Add New Staff</h3>

                <p>
                  Create a new AquaFlow staff
                  account.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeAddStaff}
                disabled={addingStaff}
              >
                ×
              </button>

            </div>


            <form
              className="staff-form"
              onSubmit={handleAddStaff}
            >

              <label>
                Full Name
              </label>

              <input
                type="text"
                value={staffName}
                onChange={(e) =>
                  setStaffName(e.target.value)
                }
                placeholder="Enter staff name"
                disabled={addingStaff}
              />


              <label>
                Phone Number
              </label>

              <input
                type="text"
                value={staffPhone}
                onChange={(e) =>
                  setStaffPhone(e.target.value)
                }
                placeholder="Enter phone number"
                disabled={addingStaff}
              />


              <label>
                Password
              </label>

              <input
                type="password"
                value={staffPassword}
                onChange={(e) =>
                  setStaffPassword(
                    e.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                disabled={addingStaff}
              />


              {staffError && (

                <p className="staff-form-error">
                  {staffError}
                </p>

              )}


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeAddStaff}
                  disabled={addingStaff}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-staff-button"
                  disabled={addingStaff}
                >
                  {addingStaff
                    ? "Creating..."
                    : "Create Staff"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
};

export default Users;