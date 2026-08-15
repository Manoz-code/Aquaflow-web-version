
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Deliveries from "./pages/Deliveries";
import Drivers from "./pages/Drivers";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import SecurityAlerts from "./pages/SecurityAlerts";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>

      {/* =========================
          LOGIN
      ========================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =========================
          ADMIN DASHBOARD
      ========================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* =========================
          ADMIN USERS
      ========================== */}

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <Users />
          </ProtectedRoute>
        }
      />


{/* SECURITY ALERTS */}
<Route
path="/admin/alerts"
element={ <ProtectedRoute allowedRole="admin"> <SecurityAlerts /> </ProtectedRoute>
}
/>


      {/* =========================
          STAFF DASHBOARD
      ========================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* =========================
          CUSTOMERS
      ========================== */}

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />


      {/* =========================
          CUSTOMER DETAILS
      ========================== */}

      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetails />
          </ProtectedRoute>
        }
      />


      {/* =========================
          DRIVERS
      ========================== */}

      <Route
        path="/drivers"
        element={
          <ProtectedRoute>
            <Drivers />
          </ProtectedRoute>
        }
      />


      {/* =========================
          DELIVERIES
      ========================== */}

      <Route
        path="/deliveries"
        element={
          <ProtectedRoute>
            <Deliveries />
          </ProtectedRoute>
        }
      />


      {/* =========================
          PAYMENTS
      ========================== */}

      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />


      {/* =========================
          PROFILE
      ========================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />


      {/* =========================
          UNKNOWN ROUTES
      ========================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
  path="/reports"
  element={
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
};

export default App;

