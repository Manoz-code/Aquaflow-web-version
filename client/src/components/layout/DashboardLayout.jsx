
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <main className="dashboard-main">

        {/* TOPBAR */}
        <Topbar />

        {/* PAGE CONTENT */}
        <section className="dashboard-content">
          {children}
        </section>

      </main>

    </div>
  );
};

export default DashboardLayout;
