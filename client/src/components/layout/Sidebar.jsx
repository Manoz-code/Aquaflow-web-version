import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import {
  getUnreadSecurityAlertCount,
} from "../../services/api";

import "./Sidebar.css";


const Sidebar = () => {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [
    securityAlertCount,
    setSecurityAlertCount,
  ] = useState(0);


  // =====================================================
  // LOAD UNREAD SECURITY ALERT COUNT
  // =====================================================

  const loadSecurityAlertCount = async () => {

    // Only admin needs security notifications

    if (user?.role !== "admin") {
      setSecurityAlertCount(0);
      return;
    }

    try {

      const data =
        await getUnreadSecurityAlertCount();

      setSecurityAlertCount(
        data.unread_count || 0
      );

    } catch (error) {

      console.error(
        "Security alert count error:",
        error
      );

    }
  };


  // =====================================================
  // LOAD COUNT WHEN ADMIN LOGS IN
  // =====================================================

  useEffect(() => {

    if (user?.role !== "admin") {
      setSecurityAlertCount(0);
      return;
    }

    // Load immediately

    loadSecurityAlertCount();


    // Check every 10 seconds

    const interval = setInterval(() => {

      loadSecurityAlertCount();

    }, 10000);


    // Cleanup

    return () => {
      clearInterval(interval);
    };

  }, [user?.role]);


  // =====================================================
  // REFRESH COUNT WHEN PAGE CHANGES
  // =====================================================

  useEffect(() => {

    if (user?.role !== "admin") {
      return;
    }

    loadSecurityAlertCount();

  }, [location.pathname]);


  return (
    <aside className="sidebar">


      {/* =========================
          LOGO
      ========================== */}

      <div className="sidebar-brand">

        <div className="sidebar-logo-icon">

          <span className="water-drop">
            💧
          </span>

        </div>

        <div>

          <h2>
            AquaFlow
          </h2>

          <span>
            Water Supply
          </span>

        </div>

      </div>


      {/* =========================
          NAVIGATION
      ========================== */}

      <nav className="sidebar-nav">


        {/* DASHBOARD */}

        <NavLink
          to={
            user?.role === "admin"
              ? "/admin"
              : "/dashboard"
          }
        >

          <span className="nav-icon">
            ⌂
          </span>

          <span className="nav-label">
            Dashboard
          </span>

        </NavLink>


        {/* CUSTOMERS */}

        <NavLink to="/customers">

          <span className="nav-icon">
            ♟
          </span>

          <span className="nav-label">
            Customers
          </span>

        </NavLink>


        {/* DRIVERS */}

        <NavLink to="/drivers">

          <span className="nav-icon">
            🚚
          </span>

          <span className="nav-label">
            Drivers
          </span>

        </NavLink>


        {/* DELIVERIES */}

        <NavLink to="/deliveries">

          <span className="nav-icon">
            💧
          </span>

          <span className="nav-label">
            Deliveries
          </span>

        </NavLink>


        {/* PAYMENTS */}

        <NavLink to="/payments">

          <span className="nav-icon">
            ₹
          </span>

          <span className="nav-label">
            Payments
          </span>

        </NavLink>


        {/* REPORTS */}

        <NavLink to="/reports">

          <span className="nav-icon">
            ▤
          </span>

          <span className="nav-label">
            Reports
          </span>

        </NavLink>


        {/* PROFILE */}

        <NavLink to="/profile">

          <span className="nav-icon">
            👤
          </span>

          <span className="nav-label">
            Profile
          </span>

        </NavLink>


        {/* =========================
            ADMIN ONLY
        ========================== */}

        {user?.role === "admin" && (
          <>


            {/* USERS */}

            <NavLink to="/admin/users">

              <span className="nav-icon">
                👥
              </span>

              <span className="nav-label">
                Users
              </span>

            </NavLink>


            {/* SECURITY ALERTS */}

            <NavLink to="/admin/alerts">

              <span className="nav-icon">
                ⚠
              </span>

              <span className="nav-label">
                Security Alerts
              </span>


              {/* UNREAD COUNT */}

              {securityAlertCount > 0 && (

                <span className="security-alert-badge">

                  {securityAlertCount > 99
                    ? "99+"
                    : securityAlertCount}

                </span>

              )}

            </NavLink>

          </>
        )}

      </nav>


      {/* =========================
          SIDEBAR BOTTOM
      ========================== */}

      <div className="sidebar-bottom">


        {/* USER PROFILE */}

        <div
          className="sidebar-user"
          onClick={() =>
            navigate("/profile")
          }
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {

            if (
              e.key === "Enter" ||
              e.key === " "
            ) {

              navigate("/profile");

            }

          }}
        >


          {/* AVATAR */}

          <div className="sidebar-avatar">

            {user?.profile_image ? (

              <img
                src={`http://localhost:3000${user.profile_image}`}
                alt={user.name}
              />

            ) : (

              user?.name
                ?.charAt(0)
                .toUpperCase()

            )}

          </div>


          {/* USER INFO */}

          <div className="sidebar-user-info">

            <strong>
              {user?.name}
            </strong>

            <span>

              {user?.role === "admin"
                ? "Administrator"
                : "Staff"}

            </span>

          </div>

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </aside>
  );
};


export default Sidebar;