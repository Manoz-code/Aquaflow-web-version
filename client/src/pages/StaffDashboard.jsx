import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./StaffDashboard.css";

import {
  getDeliveries,
  getCustomers,
} from "../services/api";


const StaffDashboard = () => {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [deliveries, setDeliveries] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);

        setError("");


        const [
          deliveryData,
          customerData,
        ] = await Promise.all([

          getDeliveries(),

          getCustomers(),

        ]);


        setDeliveries(
          deliveryData?.deliveries || []
        );


        setCustomers(
          customerData?.customers || []
        );


      } catch (error) {

        console.error(
          "Dashboard error:",
          error
        );


        setError(
          error.message ||
          "Failed to load dashboard data"
        );


      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, []);


  // =====================================================
  // DELIVERY STATISTICS
  // =====================================================

  const pendingDeliveries =
    deliveries.filter(
      (delivery) =>
        delivery.delivery_status === "pending"
    ).length;


  const completedDeliveries =
    deliveries.filter(
      (delivery) =>
        delivery.delivery_status === "delivered"
    ).length;


  const totalCustomers =
    customers.length;


  // =====================================================
  // RECENT DELIVERIES
  // =====================================================

  const recentDeliveries =
    deliveries.slice(0, 5);


  // =====================================================
  // CURRENT DATE
  // =====================================================

  const currentDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    if (status === "pending") {
      return "status pending";
    }


    if (status === "delivered") {
      return "status completed";
    }


    if (status === "cancelled") {
      return "status cancelled";
    }


    return "status";

  };


  // =====================================================
  // STATUS TEXT
  // =====================================================

  const getStatusText = (status) => {

    if (status === "pending") {
      return "Pending";
    }


    if (status === "delivered") {
      return "Completed";
    }


    if (status === "cancelled") {
      return "Cancelled";
    }


    return status || "Unknown";

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="staff-dashboard">

        <section className="dashboard-header">

          <div>

            <h1>
              Welcome back!
            </h1>

            <p>
              Here's what's happening today.
            </p>

          </div>


          <div className="dashboard-date">
            {currentDate}
          </div>

        </section>


        <div className="delivery-empty">
          Loading dashboard...
        </div>

      </div>

    );

  }


  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (

    <div className="staff-dashboard">


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-header">

        <div>

          <h1>
            Welcome back!
          </h1>

          <p>
            Here's what's happening today.
          </p>

        </div>


        <div className="dashboard-date">

          {currentDate}

        </div>

      </section>



      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="dashboard-error">

          {error}

        </div>

      )}



      {/* =================================================
          TODAY'S OVERVIEW
      ================================================= */}

      <section className="dashboard-section">

        <h2>
          Today's Overview
        </h2>


        <div className="overview-cards">


          {/* PENDING */}

          <div className="overview-card">

            <span className="overview-icon">
              🚚
            </span>


            <div>

              <span className="overview-label">
                Pending Deliveries
              </span>


              <strong>
                {pendingDeliveries}
              </strong>

            </div>

          </div>



          {/* COMPLETED */}

          <div className="overview-card">

            <span className="overview-icon">
              ✓
            </span>


            <div>

              <span className="overview-label">
                Completed Deliveries
              </span>


              <strong>
                {completedDeliveries}
              </strong>

            </div>

          </div>



          {/* CUSTOMERS */}

          <div className="overview-card">

            <span className="overview-icon">
              👥
            </span>


            <div>

              <span className="overview-label">
                Total Customers
              </span>


              <strong>
                {totalCustomers}
              </strong>

            </div>

          </div>


        </div>

      </section>



      {/* =================================================
          TODAY'S DELIVERIES
      ================================================= */}

      <section className="dashboard-section">


        {/* SECTION HEADER */}

        <div className="section-heading">

          <h2>
            Today's Deliveries
          </h2>


          <button
            type="button"
            onClick={() =>
              navigate("/deliveries")
            }
          >
            View All
          </button>

        </div>



        {/* =================================================
            SCROLL CONTAINER

            THIS is the element that scrolls.
        ================================================= */}

        <div className="delivery-table-wrapper">


          <div className="delivery-table">


            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <div className="delivery-row delivery-header">

              <span>
                Customer
              </span>


              <span>
                Address
              </span>


              <span>
                Quantity
              </span>


              <span>
                Status
              </span>


              <span>
                Action
              </span>

            </div>



            {/* =================================================
                EMPTY
            ================================================= */}

            {recentDeliveries.length === 0 && (

              <div className="delivery-empty">

                No deliveries found.

              </div>

            )}



            {/* =================================================
                DELIVERY ROWS
            ================================================= */}

            {recentDeliveries.map(
              (delivery) => (

                <div
                  className="delivery-row"
                  key={delivery.id}
                >


                  {/* CUSTOMER */}

                  <span>

                    {delivery.customer_name || "—"}

                  </span>



                  {/* ADDRESS */}

                  <span>

                    {delivery.customer_address || "—"}

                  </span>



                  {/* QUANTITY */}

                  <span>

                    {delivery.quantity_liters || 0} Liters

                  </span>



                  {/* STATUS */}

                  <span>

                    <span
                      className={getStatusClass(
                        delivery.delivery_status
                      )}
                    >

                      {getStatusText(
                        delivery.delivery_status
                      )}

                    </span>

                  </span>



                  {/* ACTION */}

                  <span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/customers/${delivery.customer_id}`
                        )
                      }
                    >
                      View
                    </button>

                  </span>


                </div>

              )
            )}


          </div>

        </div>


      </section>



      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="dashboard-section">


        <h2>
          Quick Actions
        </h2>


        <div className="quick-actions">


          {/* CUSTOMERS */}

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate("/customers")
            }
          >

            <span>
              👥
            </span>


            <div>

              <strong>
                Customers
              </strong>

              <small>
                Manage customers
              </small>

            </div>

          </button>



          {/* DELIVERIES */}

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate("/deliveries")
            }
          >

            <span>
              💧
            </span>


            <div>

              <strong>
                Deliveries
              </strong>

              <small>
                Manage deliveries
              </small>

            </div>

          </button>


        </div>

      </section>


    </div>

  );

};


export default StaffDashboard;